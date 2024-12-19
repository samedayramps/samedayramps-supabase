export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_accessibility_requirements: {
        Row: {
          assistance_required: boolean | null
          created_at: string
          customer_id: string
          device_length: number | null
          device_turning_radius: number | null
          device_width: number | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          id: string
          mobility_device: string
          special_requirements: string[] | null
          updated_at: string
          user_weight: number | null
        }
        Insert: {
          assistance_required?: boolean | null
          created_at?: string
          customer_id: string
          device_length?: number | null
          device_turning_radius?: number | null
          device_width?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          mobility_device: string
          special_requirements?: string[] | null
          updated_at?: string
          user_weight?: number | null
        }
        Update: {
          assistance_required?: boolean | null
          created_at?: string
          customer_id?: string
          device_length?: number | null
          device_turning_radius?: number | null
          device_width?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          mobility_device?: string
          special_requirements?: string[] | null
          updated_at?: string
          user_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_accessibility_requirements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          installation_address: string | null
          last_name: string
          phone: string
          state: string | null
          status: Database["public"]["Enums"]["customer_status"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          installation_address?: string | null
          last_name: string
          phone: string
          state?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          installation_address?: string | null
          last_name?: string
          phone?: string
          state?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      installation_details: {
        Row: {
          actual_length: number | null
          actual_rise: number | null
          created_at: string
          equipment_used: string[] | null
          handrails_secure: boolean | null
          id: string
          installation_end: string | null
          installation_start: string | null
          installed_by: string[] | null
          job_id: string
          modification_details: string | null
          modifications_required: boolean | null
          number_of_sections: number | null
          photos: Json | null
          platform_secure: boolean | null
          proper_slope: boolean | null
          surface_stable: boolean | null
          updated_at: string
        }
        Insert: {
          actual_length?: number | null
          actual_rise?: number | null
          created_at?: string
          equipment_used?: string[] | null
          handrails_secure?: boolean | null
          id?: string
          installation_end?: string | null
          installation_start?: string | null
          installed_by?: string[] | null
          job_id: string
          modification_details?: string | null
          modifications_required?: boolean | null
          number_of_sections?: number | null
          photos?: Json | null
          platform_secure?: boolean | null
          proper_slope?: boolean | null
          surface_stable?: boolean | null
          updated_at?: string
        }
        Update: {
          actual_length?: number | null
          actual_rise?: number | null
          created_at?: string
          equipment_used?: string[] | null
          handrails_secure?: boolean | null
          id?: string
          installation_end?: string | null
          installation_start?: string | null
          installed_by?: string[] | null
          job_id?: string
          modification_details?: string | null
          modifications_required?: boolean | null
          number_of_sections?: number | null
          photos?: Json | null
          platform_secure?: boolean | null
          proper_slope?: boolean | null
          surface_stable?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_details_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_locations: {
        Row: {
          address_id: string
          completed_date: string | null
          created_at: string
          id: string
          job_id: string
          scheduled_date: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
        }
        Insert: {
          address_id: string
          completed_date?: string | null
          created_at?: string
          id?: string
          job_id: string
          scheduled_date?: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Update: {
          address_id?: string
          completed_date?: string | null
          created_at?: string
          id?: string
          job_id?: string
          scheduled_date?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_locations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          job_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          job_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          job_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          installation_date: string | null
          monthly_payment_url: string | null
          monthly_rate: number
          removal_date: string | null
          setup_fee: number
          setup_fee_payment_url: string | null
          status: Database["public"]["Enums"]["job_status"]
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          installation_date?: string | null
          monthly_payment_url?: string | null
          monthly_rate?: number
          removal_date?: string | null
          setup_fee?: number
          setup_fee_payment_url?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          installation_date?: string | null
          monthly_payment_url?: string | null
          monthly_rate?: number
          removal_date?: string | null
          setup_fee?: number
          setup_fee_payment_url?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_requests: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          first_name: string
          id: string
          installation_address: string
          last_name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["lead_urgency"]
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          first_name: string
          id?: string
          installation_address: string
          last_name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["lead_urgency"]
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          first_name?: string
          id?: string
          installation_address?: string
          last_name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["lead_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "rental_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      customer_status: "active" | "inactive" | "pending"
      job_status:
        | "draft"
        | "quoted"
        | "approved"
        | "paid"
        | "scheduled"
        | "installed"
        | "completed"
        | "cancelled"
      lead_status: "new" | "contacted" | "quoted" | "closed" | "lost"
      lead_urgency: "low" | "medium" | "high"
      location_type: "installation" | "removal"
      payment_status: "pending" | "paid" | "refunded"
      payment_type: "setup" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
