"use client"

import React, { useState, useEffect } from "react"
import { use } from "react"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { CustomerSearch } from "../../components/customer-search"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { updateJob } from "../../actions"
import { useRouter } from "next/navigation"
import { getServiceSupabase } from "@/lib/supabase/service-role"
import type { Database } from "@/database.types"

type Job = Database['public']['Tables']['jobs']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

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

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [job, setJob] = useState<Job | null>(null)

  const resolvedParams = use(params)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      status: "draft",
      setup_fee: 0,
      monthly_rate: 0,
      installation_date: null,
      removal_date: null,
    },
  })

  // Fetch job data
  useEffect(() => {
    async function fetchJob() {
      const supabase = getServiceSupabase()
      const { data: job, error } = await supabase
        .from("jobs")
        .select(`
          *,
          customer:customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            status,
            created_at,
            updated_at
          )
        `)
        .eq("id", resolvedParams.id)
        .single()

      if (error) {
        console.error("Error fetching job:", error)
        toast.error("Failed to load job")
        return
      }

      if (!job) {
        notFound()
      }

      setJob(job)
      setSelectedCustomer(job.customer)
      form.reset({
        customer_id: job.customer_id,
        status: job.status,
        setup_fee: job.setup_fee,
        monthly_rate: job.monthly_rate,
        installation_date: job.installation_date ? new Date(job.installation_date) : null,
        removal_date: job.removal_date ? new Date(job.removal_date) : null,
      })
    }
    fetchJob()
  }, [resolvedParams.id, form])

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)
      await updateJob(resolvedParams.id, {
        ...values,
        installation_date: values.installation_date?.toISOString() || null,
        removal_date: values.removal_date?.toISOString() || null,
      })
      toast.success("Job updated successfully")
      router.push(`/admin/jobs/${resolvedParams.id}`)
    } catch (error) {
      toast.error("Failed to update job")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update the Calendar components' disabled props
  const isDateDisabled = (date: Date): boolean => {
    return date < new Date()
  }

  const isRemovalDateDisabled = (date: Date): boolean => {
    const installationDate = form.getValues("installation_date")
    return date < new Date() || (installationDate ? date < installationDate : false)
  }

  if (!job) {
    return null // or loading state
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/jobs/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Job</h2>
            <p className="text-muted-foreground">
              Update job information
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <CustomerSearch
                        onSelect={(customer) => {
                          field.onChange(customer.id)
                          setSelectedCustomer(customer)
                        }}
                        initialValue={selectedCustomer}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCustomer && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="installed">Installed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="setup_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installation_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Installation Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="removal_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Removal Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={isRemovalDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href={`/admin/jobs/${resolvedParams.id}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 