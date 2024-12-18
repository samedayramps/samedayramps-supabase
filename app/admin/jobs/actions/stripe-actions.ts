// app/admin/jobs/actions/stripe-actions.ts
"use server"

import Stripe from 'stripe'
import { getServiceSupabase } from '@/lib/supabase/service-role'
import { getCurrentUser } from '@/features/auth/utils/auth-utils'
import { requireRole } from '@/features/auth/utils/role-utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
})

// Test expiry: Any future date (e.g., 12/34)
// Test CVC: Any 3 digits (e.g., 123)

export async function createJobInvoice(jobId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase();

  // Fetch job and customer details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`
      *,
      customer:customers (
        id,
        first_name,
        last_name,
        email,
        phone,
        installation_address
      )
    `)
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error("Failed to fetch job details");
  }

  try {
    let setupFeeInvoice: Stripe.Invoice | undefined;
    
    // Find or create Stripe customer
    let stripeCustomer;
    const { data: customers } = await stripe.customers.search({
      query: `email:'${job.customer.email}'`,
    });

    if (customers && customers.length > 0) {
      stripeCustomer = customers[0];
    } else {
      stripeCustomer = await stripe.customers.create({
        email: job.customer.email,
        name: `${job.customer.first_name} ${job.customer.last_name}`,
        phone: job.customer.phone || undefined,
        address: job.customer.installation_address ? {
          line1: job.customer.installation_address
        } : undefined,
        metadata: {
          supabase_customer_id: job.customer.id,
        },
        preferred_locales: ['en-US'],
      });

      // Verify customer after creation
      console.log('Stripe customer created:', {
        id: stripeCustomer.id,
        email: stripeCustomer.email,
      });
    }

    // Create a product for this specific job
    const product = await stripe.products.create({
      name: `Ramp Rental - Job #${job.id}`,
      metadata: {
        job_id: job.id,
      },
    });

    // Create setup fee invoice if amount is greater than 0
    if (job.setup_fee > 0) {
      setupFeeInvoice = await stripe.invoices.create({
        customer: stripeCustomer.id,
        collection_method: 'send_invoice',
        days_until_due: 30,
        metadata: {
          job_id: job.id,
          type: 'setup',
          customer_name: `${job.customer.first_name} ${job.customer.last_name}`,
          customer_email: job.customer.email,
          installation_address: job.customer.installation_address || 'Not provided'
        },
        custom_fields: [
          {
            name: 'Job ID',
            value: job.id,
          },
          {
            name: 'Installation Address',
            value: job.customer.installation_address || 'Not provided',
          }
        ],
        description: `Setup Fee for Ramp Installation - Job #${job.id}`,
        footer: `Thank you for your business, ${job.customer.first_name}!`,
      });

      // Create the invoice item FIRST
      await stripe.invoiceItems.create({
        customer: stripeCustomer.id,
        invoice: setupFeeInvoice.id,
        amount: Math.round(job.setup_fee * 100), // Convert to cents
        currency: 'usd',
        description: `Ramp Installation Setup Fee - Job #${job.id}
          Customer: ${job.customer.first_name} ${job.customer.last_name}
          Address: ${job.customer.installation_address || 'Not provided'}`,
      });

      // Retrieve the invoice to verify the amount
      setupFeeInvoice = await stripe.invoices.retrieve(setupFeeInvoice.id);
      console.log('Setup fee invoice amount:', {
        amount: setupFeeInvoice.amount_due,
        expected: Math.round(job.setup_fee * 100)
      });

      if (setupFeeInvoice.amount_due === 0) {
        console.error('Setup fee invoice has zero amount');
        throw new Error('Setup fee invoice amount is zero');
      }

      await stripe.invoices.finalizeInvoice(setupFeeInvoice.id, {
        auto_advance: true
      });

      // Retrieve the finalized invoice to get the hosted URL
      setupFeeInvoice = await stripe.invoices.retrieve(setupFeeInvoice.id);
      
      console.log('Setup fee invoice after finalization:', {
        id: setupFeeInvoice.id,
        hostedUrl: setupFeeInvoice.hosted_invoice_url,
        status: setupFeeInvoice.status
      });

      await stripe.invoices.sendInvoice(setupFeeInvoice.id);
      
      // Log the invoice details
      console.log('Invoice created and sent:', {
        id: setupFeeInvoice.id,
        customer_email: job.customer.email,
        amount: setupFeeInvoice.amount_due,
        status: setupFeeInvoice.status,
      });
      
      // Update job with setup fee payment URL
      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update({
          setup_fee_payment_url: setupFeeInvoice.hosted_invoice_url,
          status: 'quoted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update job with setup fee URL:', {
          error: updateError,
          jobId: job.id,
          url: setupFeeInvoice.hosted_invoice_url
        });
        throw updateError;
      }

      console.log('Updated job with setup fee URL:', {
        jobId: updatedJob.id,
        setupFeeUrl: updatedJob.setup_fee_payment_url,
        invoiceUrl: setupFeeInvoice.hosted_invoice_url
      });
      
      setupFeeInvoice = setupFeeInvoice; // Update the reference for later use
    }

    // Create monthly subscription if monthly rate is greater than 0
    if (job.monthly_rate > 0) {
      // Create a price for the monthly rate
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(job.monthly_rate * 100),
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      });

      // Create the subscription without billing_cycle_anchor
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: price.id }],
        metadata: {
          job_id: job.id,
          type: 'monthly',
        },
        collection_method: 'send_invoice',
        days_until_due: 30,
        // Remove billing_cycle_anchor to start immediately
        proration_behavior: 'none',
      });

      // Get the initial invoice
      const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

      // Add metadata to the invoice BEFORE finalizing
      await stripe.invoices.update(latestInvoice.id, {
        metadata: {
          job_id: job.id,
          type: 'monthly',
          customer_name: `${job.customer.first_name} ${job.customer.last_name}`,
          customer_email: job.customer.email,
          installation_address: job.customer.installation_address || 'Not provided'
        },
        custom_fields: [
          {
            name: 'Job ID',
            value: job.id,
          },
          {
            name: 'Installation Address',
            value: job.customer.installation_address || 'Not provided',
          },
          {
            name: 'Billing Cycle',
            value: 'Monthly'
          }
        ],
        description: `Monthly Ramp Rental Fee - Job #${job.id}`,
        footer: `Thank you for your business, ${job.customer.first_name}!
          Your monthly rental period begins today.`
      });

      // Log the invoice metadata
      console.log('Monthly invoice metadata:', {
        id: latestInvoice.id,
        metadata: await stripe.invoices.retrieve(latestInvoice.id).then(inv => inv.metadata)
      });

      // Then continue with finalizing and sending
      await stripe.invoices.finalizeInvoice(latestInvoice.id, {
        auto_advance: true
      });

      // Retrieve the finalized invoice to get the hosted URL
      const finalizedInvoice = await stripe.invoices.retrieve(latestInvoice.id);
      
      console.log('Monthly invoice after finalization:', {
        id: finalizedInvoice.id,
        hostedUrl: finalizedInvoice.hosted_invoice_url,
        status: finalizedInvoice.status
      });

      await stripe.invoices.sendInvoice(finalizedInvoice.id);

      // Log invoice details
      console.log('Monthly invoice sent:', {
        id: finalizedInvoice.id,
        customer_email: job.customer.email,
        amount: finalizedInvoice.amount_due,
        status: finalizedInvoice.status,
      });

      // Update job with both subscription ID and payment URL
      const { data: updatedWithSubscription, error: subscriptionUpdateError } = await supabase
        .from('jobs')
        .update({
          stripe_subscription_id: subscription.id,
          monthly_payment_url: finalizedInvoice.hosted_invoice_url,
          status: 'quoted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)
        .select()
        .single();

      if (subscriptionUpdateError) {
        console.error('Failed to update job with subscription:', {
          error: subscriptionUpdateError,
          jobId: job.id,
          url: finalizedInvoice.hosted_invoice_url
        });
        throw subscriptionUpdateError;
      }

      console.log('Updated job with subscription:', {
        jobId: updatedWithSubscription.id,
        monthlyUrl: updatedWithSubscription.monthly_payment_url,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        subscriptionId: updatedWithSubscription.stripe_subscription_id
      });

      return {
        setupFeeInvoiceUrl: setupFeeInvoice?.hosted_invoice_url || null,
        monthlyInvoiceUrl: finalizedInvoice.hosted_invoice_url || null,
        subscriptionId: subscription.id
      };
    }

    return {
      setupFeeInvoiceUrl: setupFeeInvoice?.hosted_invoice_url || null,
      success: true
    };
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
}

export async function cancelJobSubscription(jobId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase();

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select('*')
    .eq("id", jobId)
    .single();

  if (jobError || !job || !job.stripe_subscription_id) {
    throw new Error("Failed to fetch job details or no subscription found");
  }

  try {
    // Cancel the subscription
    await stripe.subscriptions.cancel(job.stripe_subscription_id);

    // Update job status
    await supabase
      .from('jobs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return { success: true };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}