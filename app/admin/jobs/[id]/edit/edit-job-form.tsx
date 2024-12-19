'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { updateJob } from "../../actions"
import { CustomerSearch } from "../../components/customer-search"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Database } from "@/database.types"

type Job = Database['public']['Tables']['jobs']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
}

const formSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  status: z.enum([
    "draft",
    "quoted",
    "approved",
    "paid",
    "scheduled",
    "installed",
    "completed",
    "cancelled",
  ] as const),
  setup_fee: z.coerce
    .number()
    .min(0, "Setup fee must be greater than or equal to 0"),
  monthly_rate: z.coerce
    .number()
    .min(0, "Monthly rate must be greater than or equal to 0"),
  installation_date: z.date().nullable(),
  removal_date: z.date().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export function EditJobForm({ job }: { job: Job }) {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<Database['public']['Tables']['customers']['Row'] | null>(job.customer)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: job.customer_id,
      status: job.status,
      setup_fee: job.setup_fee,
      monthly_rate: job.monthly_rate,
      installation_date: job.installation_date ? new Date(job.installation_date) : null,
      removal_date: job.removal_date ? new Date(job.removal_date) : null,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)
      await updateJob(job.id, {
        ...values,
        installation_date: values.installation_date?.toISOString() || null,
        removal_date: values.removal_date?.toISOString() || null,
      })
      toast.success("Job updated successfully")
      router.push(`/admin/jobs/${job.id}`)
    } catch (error) {
      toast.error("Failed to update job")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields go here - copy from your existing form JSX */}
      </form>
    </Form>
  )
} 