"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CustomerAccessibilityRequirements, MobilityDevice } from "../types"

const formSchema = z.object({
  mobility_device: z.enum(["wheelchair", "walker", "scooter", "other"] as const),
  device_width: z.number().min(0).optional(),
  device_length: z.number().min(0).optional(),
  device_turning_radius: z.number().min(0).optional(),
  user_weight: z.number().min(0).optional(),
  assistance_required: z.boolean().default(false),
  special_requirements: z.string().optional(),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  emergency_contact_relationship: z.string().min(1, "Emergency contact relationship is required"),
})

type FormValues = z.infer<typeof formSchema>

interface AccessibilityRequirementsFormProps {
  customerId: string
  initialData?: CustomerAccessibilityRequirements
  onSubmit: (data: FormValues) => Promise<void>
}

export function AccessibilityRequirementsForm({
  customerId,
  initialData,
  onSubmit,
}: AccessibilityRequirementsFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobility_device: initialData?.mobility_device || "wheelchair",
      device_width: initialData?.device_width,
      device_length: initialData?.device_length,
      device_turning_radius: initialData?.device_turning_radius,
      user_weight: initialData?.user_weight,
      assistance_required: initialData?.assistance_required || false,
      special_requirements: initialData?.special_requirements?.join("\n"),
      emergency_contact_name: initialData?.emergency_contact_name || "",
      emergency_contact_phone: initialData?.emergency_contact_phone || "",
      emergency_contact_relationship: initialData?.emergency_contact_relationship || "",
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values)
      toast.success("Accessibility requirements saved successfully")
    } catch (error) {
      toast.error("Failed to save accessibility requirements")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mobility_device"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobility Device</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mobility device" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="wheelchair">Wheelchair</SelectItem>
                  <SelectItem value="walker">Walker</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="device_width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Width (inches)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="device_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Length (inches)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="device_turning_radius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turning Radius (inches)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="user_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Weight (lbs)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assistance_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Assistance Required</FormLabel>
                <FormDescription>
                  Does the user require assistance using the ramp?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="special_requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any special requirements or notes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Emergency Contact</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="emergency_contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_contact_relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Save Requirements</Button>
      </form>
    </Form>
  )
} 