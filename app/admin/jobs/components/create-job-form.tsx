"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createJob } from "../actions"
import { useState } from "react"
import { toast } from "sonner"
import { CustomerSearch } from "./customer-search"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Database } from "@/database.types"

type Customer = Database['public']['Tables']['customers']['Row']

const formSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
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

export function CreateJobForm() {
  const [open, setOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      setup_fee: 0,
      monthly_rate: 0,
      installation_date: null,
      removal_date: null,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createJob({
        ...values,
        status: "draft",
        installation_date: values.installation_date?.toISOString() || null,
        removal_date: values.removal_date?.toISOString() || null,
        stripe_subscription_id: null,
        setup_fee_payment_url: null,
        monthly_payment_url: null
      })
      
      setOpen(false)
      form.reset()
      setSelectedCustomer(null)
      toast.success("Job created successfully")
    } catch (error) {
      toast.error("Failed to create job")
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a new job by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-sm text-muted-foreground">{selectedCustomer.installation_address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date when the ramp will be installed.
                    </FormDescription>
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
                          disabled={(date) =>
                            date < (form.getValues("installation_date") || new Date())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date when the ramp will be removed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                  setSelectedCustomer(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 