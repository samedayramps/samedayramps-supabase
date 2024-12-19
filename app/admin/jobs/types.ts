export type JobStatus =
  | "draft"
  | "quoted"
  | "approved"
  | "paid"
  | "scheduled"
  | "installed"
  | "completed"
  | "cancelled"

export type PaymentType = "setup" | "monthly"
export type PaymentStatus = "pending" | "paid" | "refunded"

export interface JobPayment {
  id: string
  job_id: string
  amount: number
  type: PaymentType
  status: PaymentStatus
  stripe_payment_id: string | null
  created_at: string
}

export interface JobLocation {
  id: string
  job_id: string
  address_id: string
  type: "installation" | "removal"
  scheduled_date: string | null
  completed_date: string | null
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

export interface InstallationDetails {
  id: string
  job_id: string
  installed_by: string[]
  installation_start: string | null
  installation_end: string | null
  equipment_used: string[]
  modifications_required: boolean
  modification_details?: string
  actual_length: number
  actual_rise: number
  number_of_sections: number
  handrails_secure: boolean
  surface_stable: boolean
  proper_slope: boolean
  platform_secure: boolean
  photos: {
    before: string[]
    after: string[]
    details: string[]
  }
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  customer_id: string
  status: JobStatus
  setup_fee: number
  monthly_rate: number
  installation_date: string | null
  removal_date: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
  setup_fee_payment_url: string | null
  monthly_payment_url: string | null
  // Relations
  customer?: Customer
  locations?: JobLocation[]
  payments?: JobPayment[]
  notes?: JobNote[]
  installation_details?: InstallationDetails
} 