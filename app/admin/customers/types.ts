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
  accessibility_requirements?: CustomerAccessibilityRequirements
}

export interface JobNote {
  id: string
  job_id: string
  content: string
  created_at: string
  updated_at: string
  created_by: string
}

export type MobilityDevice = "wheelchair" | "walker" | "scooter" | "other"

export interface CustomerAccessibilityRequirements {
  id: string
  customer_id: string
  mobility_device: MobilityDevice
  device_width?: number
  device_length?: number
  device_turning_radius?: number
  user_weight?: number
  assistance_required: boolean
  special_requirements: string[]
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  created_at: string
  updated_at: string
} 