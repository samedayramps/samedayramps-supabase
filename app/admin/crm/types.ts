export type CustomerStatus = 'active' | 'inactive' | 'pending';
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'closed' | 'lost';
export type LeadUrgency = 'low' | 'medium' | 'high';

export interface RentalRequest {
  id: string
  customer_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  installation_address: string
  notes: string | null
  status: LeadStatus
  urgency: LeadUrgency
  created_at: string
  updated_at: string
}

export type CreateRentalRequest = Omit<RentalRequest, 
  'id' | 'customer_id' | 'created_at' | 'updated_at'> & {
  status?: LeadStatus
  notes?: string | null
}

export type UpdateRentalRequest = Partial<Omit<RentalRequest, 
  'id' | 'created_at' | 'updated_at'>> 