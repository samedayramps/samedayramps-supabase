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
  setup_fee_payment_url: string | null;
  monthly_payment_url: string | null;
  // Relations
  customer?: Customer
  locations?: JobLocation[]
  payments?: JobPayment[]
  notes?: JobNote[]
} 