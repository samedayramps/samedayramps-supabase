"use server"

import { getServiceSupabase } from '@/lib/supabase/service-role'
import { Job, JobLocation, JobPayment, JobNote } from "./types"
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