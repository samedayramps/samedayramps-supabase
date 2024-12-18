export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  installation_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  status: "active" | "inactive" | "pending"
  created_at: string
  updated_at: string
}

export interface JobNote {
  id: string
  job_id: string
  content: string
  created_at: string
  updated_at: string
  created_by: string
} 