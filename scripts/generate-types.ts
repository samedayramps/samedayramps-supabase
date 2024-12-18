import { createClient } from "@supabase/supabase-js"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import "dotenv/config"

async function generateTypes() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log("Fetching database types...")
    const { data, error } = await supabase.from("customers").select().limit(0)
    if (error) throw error

    const types = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      customer_notes: {
        Row: {
          id: string
          customer_id: string
          content: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          customer_id: string
          content: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          customer_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          status: string
          setup_fee: number
          monthly_rate: number
          installation_date: string | null
          removal_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          status?: string
          setup_fee: number
          monthly_rate: number
          installation_date?: string | null
          removal_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          status?: string
          setup_fee?: number
          monthly_rate?: number
          installation_date?: string | null
          removal_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_notes: {
        Row: {
          id: string
          job_id: string
          content: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          job_id: string
          content: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          job_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      job_payments: {
        Row: {
          id: string
          job_id: string
          amount: number
          type: string
          status: string
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          amount: number
          type: string
          status?: string
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          amount?: number
          type?: string
          status?: string
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}`

    const typesDir = join(process.cwd(), 'types', 'supabase')
    if (!existsSync(typesDir)) {
      mkdirSync(typesDir, { recursive: true })
    }

    writeFileSync(join(typesDir, 'database.types.ts'), types)

    console.log('✅ Types generated successfully')
  } catch (error) {
    console.error('Error generating types:', error)
    process.exit(1)
  }
}

generateTypes().catch(console.error) 