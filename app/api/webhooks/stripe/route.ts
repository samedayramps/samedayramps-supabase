import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServiceSupabase } from '@/lib/supabase/service-role'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!
    console.log('Webhook received - Signature:', signature?.slice(0, 10) + '...')

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      )
      console.log('Webhook verified successfully. Event type:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new NextResponse('Webhook signature verification failed', { status: 400 })
    }

    const supabase = getServiceSupabase()

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Processing invoice:', {
          type: invoice.metadata?.type || 'unknown',
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount_due / 100,
          customer: {
            name: invoice.metadata?.customer_name,
            email: invoice.customer_email,
            address: invoice.metadata?.installation_address
          },
          job: {
            id: invoice.metadata?.job_id,
            description: invoice.description
          },
          metadata: invoice.metadata
        })

        // Get the job ID from metadata
        const jobId = invoice.metadata?.job_id
        if (!jobId) {
          console.error('No job ID in invoice metadata')
          break
        }

        // Insert payment record
        const { data: payment, error: paymentError } = await supabase
          .from('job_payments')
          .insert({
            job_id: jobId,
            amount: invoice.amount_paid / 100,
            type: invoice.metadata?.type || 'setup',
            status: 'paid',
            stripe_payment_id: invoice.id,
          })
          .select()
          .single()

        if (paymentError) {
          console.error('Error inserting payment:', paymentError)
          throw paymentError
        }

        console.log('Payment record created:', payment)

        // Update job status if needed
        if (invoice.metadata?.type === 'setup') {
          const { error: jobError } = await supabase
            .from('jobs')
            .update({
              status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId)

          if (jobError) {
            console.error('Error updating job status:', jobError)
            throw jobError
          }
          console.log('Job status updated to paid')
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const jobId = invoice.metadata?.job_id
        if (!jobId) {
          console.error('No job ID in invoice metadata')
          break
        }

        // Record failed payment
        await supabase
          .from('job_payments')
          .insert({
            job_id: jobId,
            amount: invoice.amount_due / 100,
            type: invoice.metadata?.type || 'setup',
            status: 'failed',
            stripe_payment_id: invoice.id,
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const jobId = subscription.metadata?.job_id
        if (!jobId) {
          console.error('No job ID in subscription metadata')
          break
        }

        // Update job when subscription is cancelled
        await supabase
          .from('jobs')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        break
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Processing created invoice:', {
          id: invoice.id,
          amount: invoice.amount_due,
          metadata: invoice.metadata ?? {}
        })

        const jobId = invoice.metadata?.job_id
        if (!jobId) break

        // Create a pending payment record
        await supabase
          .from('job_payments')
          .insert({
            job_id: jobId,
            amount: invoice.amount_due / 100,
            type: invoice.metadata?.type || 'setup',
            status: 'pending',
            stripe_payment_id: invoice.id,
          })

        break
      }

      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Processing finalized invoice:', {
          id: invoice.id,
          status: 'finalized'
        })
        break
      }

      case 'invoice.sent': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Processing sent invoice:', {
          id: invoice.id,
          email: invoice.customer_email
        })
        break
      }

      case 'invoice.updated': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Processing updated invoice:', {
          id: invoice.id,
          status: invoice.status,
          paid: invoice.paid
        })
        break
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (err) {
    console.error('Webhook processing failed:', err)
    return new NextResponse(
      `Webhook processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 
      { status: 500 }
    )
  }
}

export const runtime = 'edge' 