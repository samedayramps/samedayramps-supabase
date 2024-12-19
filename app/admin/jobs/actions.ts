"use server"

import { getServiceSupabase } from '@/lib/supabase/service-role'
import { Job, JobLocation, JobPayment, JobNote, InstallationDetails } from "./types"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from '@/features/auth/utils/auth-utils'
import { requireRole } from '@/features/auth/utils/role-utils'

export async function getJobs() {
  const supabase = getServiceSupabase()
  
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      *,
      locations:job_locations(*),
      payments:job_payments(*),
      notes:job_notes(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return jobs
}

export async function createJob(job: Omit<Job, "id" | "created_at" | "updated_at">) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("jobs")
    .insert([{
      ...job,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
  return data
}

export async function updateJob(jobId: string, updates: Partial<Job>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("jobs")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
  return data
}

export async function deleteJobs(jobIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  try {
    // Delete related job locations
    const { error: locationsError } = await supabase
      .from("job_locations")
      .delete()
      .in("job_id", jobIds)

    if (locationsError) {
      throw new Error(`Error deleting job locations: ${locationsError.message}`)
    }

    // Delete related job payments
    const { error: paymentsError } = await supabase
      .from("job_payments")
      .delete()
      .in("job_id", jobIds)

    if (paymentsError) {
      throw new Error(`Error deleting job payments: ${paymentsError.message}`)
    }

    // Delete related job notes
    const { error: notesError } = await supabase
      .from("job_notes")
      .delete()
      .in("job_id", jobIds)

    if (notesError) {
      throw new Error(`Error deleting job notes: ${notesError.message}`)
    }

    // Finally delete the jobs
    const { error } = await supabase
      .from("jobs")
      .delete()
      .in("id", jobIds)

    if (error) {
      throw new Error(`Error deleting jobs: ${error.message}`)
    }

    revalidatePath("/admin/jobs")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteJobs:", error)
    throw error
  }
}

export async function updateJobsStatus(jobIds: string[], status: Job["status"]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { error } = await supabase
    .from("jobs")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .in("id", jobIds)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
}

export async function updateJobStatus(jobId: string, status: Job["status"]) {
  return updateJob(jobId, { status })
}

export async function addJobLocation(location: Omit<JobLocation, "id" | "created_at" | "updated_at">) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("job_locations")
    .insert([{
      ...location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
  return data
}

export async function addJobPayment(payment: Omit<JobPayment, "id" | "created_at">) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("job_payments")
    .insert([{
      ...payment,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
  return data
}

export async function addJobNote(note: Omit<JobNote, "id" | "created_at" | "updated_at">) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("job_notes")
    .insert([{
      ...note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/jobs")
  return data
}

export async function updateInstallationDetails(
  jobId: string,
  data: Partial<InstallationDetails>
) {
  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from("installation_details")
    .upsert({
      job_id: jobId,
      ...data,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/jobs/${jobId}`)
}

export async function getInstallationDetails(jobId: string) {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from("installation_details")
    .select()
    .eq("job_id", jobId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return data
}

// Add photo upload functionality
export async function uploadInstallationPhoto(
  jobId: string,
  file: File,
  type: "before" | "after" | "details"
) {
  const supabase = getServiceSupabase()
  
  // Generate a unique filename
  const timestamp = Date.now()
  const filename = `${jobId}/${type}/${timestamp}-${file.name}`

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("installation-photos")
    .upload(filename, file)

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("installation-photos")
    .getPublicUrl(filename)

  // Update the installation details with the new photo URL
  const { data: currentDetails } = await supabase
    .from("installation_details")
    .select("photos")
    .eq("job_id", jobId)
    .single()

  const photos = currentDetails?.photos || { before: [], after: [], details: [] }
  photos[type].push(publicUrl)

  await supabase
    .from("installation_details")
    .upsert({
      job_id: jobId,
      photos,
      updated_at: new Date().toISOString(),
    })

  revalidatePath(`/admin/jobs/${jobId}`)
  return publicUrl
}

export async function sendRentalAgreement(
  jobId: string,
  signer: {
    name: string
    email: string
    phone: string
  }
) {
  const TEMPLATE_ID = process.env.ESIGNATURES_RENTAL_TEMPLATE_ID
  const API_TOKEN = process.env.ESIGNATURES_API_TOKEN

  if (!TEMPLATE_ID || !API_TOKEN) {
    throw new Error("Missing eSignatures.io configuration")
  }

  // Get job details for the agreement
  const supabase = getServiceSupabase()
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      customer:customers(*)
    `)
    .eq("id", jobId)
    .single()

  if (error || !job) {
    throw new Error("Failed to fetch job details")
  }

  // Format the installation address
  const installAddress = [
    job.customer.installation_address,
    job.customer.city,
    job.customer.state,
    job.customer.zip_code
  ].filter(Boolean).join(", ")

  // Format phone number to include country code if not present
  const formattedPhone = signer.phone.startsWith('+') ? 
    signer.phone : 
    `+1${signer.phone.replace(/\D/g, '')}`

  // Send agreement via eSignatures.io API
  const response = await fetch("https://esignatures.io/api/contracts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: API_TOKEN,
      template_id: TEMPLATE_ID,
      title: `Rental Agreement - ${signer.name}`,
      metadata: jobId,
      signers: [{
        name: signer.name,
        mobile: formattedPhone,
        signature_request_delivery_methods: ["sms"],
        signed_document_delivery_method: "sms",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you`
      }],
      placeholder_fields: [
        {
          api_key: "date",
          value: new Date().toLocaleDateString()
        },
        {
          api_key: "customerName",
          value: signer.name
        },
        {
          api_key: "monthlyRentalRate",
          value: job.monthly_rate?.toFixed(2) || "0.00"
        },
        {
          api_key: "totalUpfront",
          value: job.setup_fee?.toFixed(2) || "0.00"
        },
        {
          api_key: "installAddress",
          value: installAddress
        }
      ],
      emails: {
        signature_request_subject: "Your Same Day Ramps Rental Agreement",
        signature_request_text: "Hi __FULL_NAME__,\n\nPlease review and sign your rental agreement for Same Day Ramps.\n\nThank you!",
        final_contract_subject: "Your Signed Same Day Ramps Rental Agreement",
        final_contract_text: "Hi __FULL_NAME__,\n\nThank you for signing the rental agreement. You can find your signed copy attached.\n\nBest regards,\nSame Day Ramps"
      },
      custom_webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/esignatures`
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("eSignatures API error:", errorData)
    throw new Error(`Failed to send agreement: ${errorData.message || 'API request failed'}`)
  }

  const data = await response.json()

  // Store the agreement details in your database
  await supabase
    .from("rental_agreements")
    .upsert({
      job_id: jobId,
      contract_id: data.data.contract.id,
      status: "sent",
      sent_at: new Date().toISOString(),
      sign_page_url: data.data.contract.signers[0].sign_page_url,
      signer_name: signer.name,
      signer_email: signer.email,
      signer_phone: signer.phone,
      metadata: {
        monthly_rate: job.monthly_rate,
        setup_fee: job.setup_fee
      }
    })

  revalidatePath(`/admin/jobs/${jobId}`)
  return data
} 