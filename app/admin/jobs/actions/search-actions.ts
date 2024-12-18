"use server"

import { getServiceSupabase } from "@/lib/supabase/service-role"
import type { Database } from "@/database.types"

export type Customer = Database['public']['Tables']['customers']['Row']

export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  const supabase = getServiceSupabase()
  
  const { data, error } = await supabase
    .from("customers")
    .select()
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(5)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
} 