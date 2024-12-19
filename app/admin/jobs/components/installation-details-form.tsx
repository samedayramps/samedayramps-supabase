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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { InstallationDetails } from "../types"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  installed_by: z.array(z.string().optional()).default([]),
  installation_start: z.string().optional(),
  installation_end: z.string().optional(),
  equipment_used: z.array(z.string().optional()).default([]),
  modifications_required: z.boolean().default(false),
  modification_details: z.string().optional(),
  actual_length: z.number().min(0),
  actual_rise: z.number().min(0),
  number_of_sections: z.number().min(1),
  handrails_secure: z.boolean().default(true),
  surface_stable: z.boolean().default(true),
  proper_slope: z.boolean().default(true),
  platform_secure: z.boolean().default(true),
  // Photos will be handled separately through file uploads
})

type FormValues = z.infer<typeof formSchema>

interface InstallationDetailsFormProps {
  jobId: string
  initialData?: InstallationDetails
  onSubmit: (data: FormValues) => Promise<void>
}

export function InstallationDetailsForm({
  jobId,
  initialData,
  onSubmit,
}: InstallationDetailsFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      installed_by: initialData?.installed_by || [],
      installation_start: initialData?.installation_start || "",
      installation_end: initialData?.installation_end || "",
      equipment_used: initialData?.equipment_used || [],
      modifications_required: initialData?.modifications_required || false,
      modification_details: initialData?.modification_details || "",
      actual_length: initialData?.actual_length || 0,
      actual_rise: initialData?.actual_rise || 0,
      number_of_sections: initialData?.number_of_sections || 1,
      handrails_secure: initialData?.handrails_secure ?? true,
      surface_stable: initialData?.surface_stable ?? true,
      proper_slope: initialData?.proper_slope ?? true,
      platform_secure: initialData?.platform_secure ?? true,
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values)
      toast.success("Installation details saved successfully")
    } catch (error) {
      toast.error("Failed to save installation details")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="installed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installed By</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value.join(", ")}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map(v => v.trim())
                          .filter(Boolean);
                        field.onChange(values);
                      }}
                      placeholder="Names separated by commas" 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter installer names separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installation_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installation_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="equipment_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Used</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value.join(", ")}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map(v => v.trim())
                          .filter(Boolean);
                        field.onChange(values);
                      }}
                      placeholder="Equipment IDs separated by commas" 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter equipment IDs separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actual_length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Length (ft)</FormLabel>
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
                name="actual_rise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Rise (inches)</FormLabel>
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
              name="number_of_sections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Sections</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Safety Checklist</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="handrails_secure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Handrails Secure</FormLabel>
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
                  name="surface_stable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Surface Stable</FormLabel>
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
                  name="proper_slope"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Proper Slope</FormLabel>
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
                  name="platform_secure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Platform Secure</FormLabel>
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
              </div>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="modifications_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Modifications Required</FormLabel>
                <FormDescription>
                  Were any modifications required during installation?
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

        {form.watch("modifications_required") && (
          <FormField
            control={form.control}
            name="modification_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modification Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the modifications made..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Save Installation Details</Button>
      </form>
    </Form>
  )
} 