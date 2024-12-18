"use server"

import { getServiceSupabase } from '@/lib/supabase/service-role'
import { Customer } from "./types"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from '@/features/auth/utils/auth-utils'
import { requireRole } from '@/features/auth/utils/role-utils'

export async function searchCustomers(searchTerm: string) {
  const supabase = getServiceSupabase()
  
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, address")
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(5)

  if (error) {
    throw new Error(error.message)
  }

  return customers
}

export async function getCustomers() {
  const supabase = getServiceSupabase()
  
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return customers
}

export async function getCustomer(id: string) {
  const supabase = getServiceSupabase()
  
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return customer
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("customers")
    .insert([{
      ...customer,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/customers")
  return data
}

export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("customers")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", customerId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/customers")
  return data
}

export async function deleteCustomers(customerIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  // First delete related rental requests
  const { error: rentalRequestsError } = await supabase
    .from("rental_requests")
    .delete()
    .in("customer_id", customerIds)

  if (rentalRequestsError) {
    throw new Error(`Error deleting related rental requests: ${rentalRequestsError.message}`)
  }

  // Then delete related jobs
  const { error: jobsError } = await supabase
    .from("jobs")
    .delete()
    .in("customer_id", customerIds)

  if (jobsError) {
    throw new Error(`Error deleting related jobs: ${jobsError.message}`)
  }

  // Finally delete the customers
  const { error } = await supabase
    .from("customers")
    .delete()
    .in("id", customerIds)

  if (error) {
    throw new Error(`Error deleting customers: ${error.message}`)
  }

  revalidatePath("/admin/customers")
}

export async function updateCustomersStatus(customerIds: string[], status: Customer["status"]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await requireRole(user.id, "admin");

  const supabase = getServiceSupabase()
  
  const { error } = await supabase
    .from("customers")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .in("id", customerIds)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/customers")
} 