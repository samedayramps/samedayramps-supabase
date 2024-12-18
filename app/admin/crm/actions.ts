'use server'

import { getServiceSupabase } from '@/lib/supabase/service-role'
import { CreateRentalRequest, RentalRequest, UpdateRentalRequest } from './types'
import { revalidatePath } from 'next/cache'

export async function createRentalRequest(data: CreateRentalRequest): Promise<{ error: string | null, data: RentalRequest | null }> {
  try {
    const supabase = getServiceSupabase()
    
    const { data: rentalRequest, error } = await supabase
      .from('rental_requests')
      .insert({
        ...data,
        status: 'new',
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/crm/leads')
    return { error: null, data: rentalRequest }
  } catch (error) {
    console.error('Error creating rental request:', error)
    return { error: 'Failed to create rental request', data: null }
  }
}

export async function updateRentalRequest(
  id: string, 
  data: UpdateRentalRequest
): Promise<{ error: string | null }> {
  try {
    const supabase = getServiceSupabase()
    
    const { error } = await supabase
      .from('rental_requests')
      .update(data)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/crm/leads')
    return { error: null }
  } catch (error) {
    console.error('Error updating rental request:', error)
    return { error: 'Failed to update rental request' }
  }
}

export async function getRentalRequests() {
  try {
    const supabase = getServiceSupabase()
    
    const { data, error } = await supabase
      .from('rental_requests')
      .select(`
        id,
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        urgency,
        created_at,
        updated_at,
        installation_address,
        notes
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return { error: error.message, data: null }
    }

    console.log('Raw data from Supabase:', data)

    const transformedData = data?.map(record => ({
      id: record.id,
      customer_id: record.customer_id,
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      phone: record.phone,
      status: record.status,
      urgency: record.urgency,
      created_at: record.created_at,
      updated_at: record.updated_at,
      installation_address: record.installation_address,
      notes: record.notes
    })) || []

    console.log('Transformed data:', transformedData)

    return { error: null, data: transformedData }
  } catch (error) {
    console.error('Error in getRentalRequests:', error)
    return { error: 'Failed to fetch rental requests', data: [] }
  }
}

export async function getRentalRequest(id: string) {
  try {
    const supabase = getServiceSupabase()
    
    const { data, error } = await supabase
      .from('rental_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { error: null, data }
  } catch (error) {
    console.error('Error fetching rental request:', error)
    return { error: 'Failed to fetch rental request', data: null }
  }
} 