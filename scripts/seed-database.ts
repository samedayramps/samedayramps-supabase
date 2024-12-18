import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'
import { addMonths } from 'date-fns'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to generate a random enum value
function randomEnum<T extends string>(enumObj: Record<string, T>): T {
  const values = Object.values(enumObj)
  return values[Math.floor(Math.random() * values.length)]
}

// Define enums matching your database
const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUOTED: 'quoted',
  CLOSED: 'closed',
  LOST: 'lost',
} as const

const LeadUrgency = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

const CustomerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const

const JobStatus = {
  DRAFT: 'draft',
  QUOTED: 'quoted',
  APPROVED: 'approved',
  PAID: 'paid',
  SCHEDULED: 'scheduled',
  INSTALLED: 'installed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')

    // First, let's clean up existing data
    console.log('🧹 Cleaning up existing data...')
    await supabase.from('job_notes').delete().neq('id', '')
    await supabase.from('jobs').delete().neq('id', '')
    await supabase.from('customers').delete().neq('id', '')

    // Generate customers
    console.log('📝 Inserting customers...')
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          status: 'active',
          installation_address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip_code: '12345',
        },
        // Add more test customers as needed
      ])
      .select()

    if (customerError) throw customerError
    if (!customers) throw new Error('No customers inserted')

    console.log('📝 Inserting jobs...')
    const jobs = customers.map((customer) => ({
      customer_id: customer.id,
      status: 'approved',
      setup_fee: 997.00,
      monthly_rate: 258.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: insertedJobs, error: jobsError } = await supabase
      .from('jobs')
      .insert(jobs)
      .select()

    if (jobsError) throw jobsError
    console.log('✅ Inserted jobs:', insertedJobs)

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase() 