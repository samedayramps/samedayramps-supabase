import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, DollarSign, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { AddNoteDialog } from "../components/add-note-dialog"
import { Job, JobNote } from "../types"
import { JobTimeline } from "../components/job-timeline"
import { PaymentHistory } from "../components/payment-history"
import { JobDocuments } from "../components/job-documents"
import { getServiceSupabase } from "@/lib/supabase/service-role"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"
import { createJobInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { toast } from "react-hot-toast"
import { JobDetailActions } from "../components/job-detail-actions"
import { PaymentLinkButton } from "../components/payment-link-button"

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    await requireRole(user.id, "admin");
  } catch (error) {
    redirect("/unauthorized");
  }

  const supabase = getServiceSupabase();
  
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      customer:customers (
        id,
        first_name,
        last_name,
        email
      ),
      notes:job_notes (
        id,
        content,
        created_at,
        created_by
      ),
      payments:job_payments (*)
    `)
    .eq("id", id)
    .order("created_at", { foreignTable: "job_notes", ascending: false })
    .single()

  console.log('Job details:', {
    id: job.id,
    setupFeeUrl: job.setup_fee_payment_url,
    monthlyUrl: job.monthly_payment_url
  });

  if (error) {
    console.error('JobPage: Supabase error:', error)
    throw error
  }

  if (!job) {
    console.log('JobPage: No job found with ID:', id)
    notFound()
  }

  const typedJob = job as Job & { notes: JobNote[] }

  // Mock timeline events for now
  // TODO: Implement actual status history tracking
  const timelineEvents = [
    {
      status: typedJob.status,
      date: typedJob.updated_at,
      description: `Job marked as ${typedJob.status}`,
    },
  ]

  // Mock documents for now
  // TODO: Implement actual document storage
  const documents: any[] = []

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admin/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Job Details</h2>
            <p className="text-muted-foreground">
              View and manage job information
            </p>
          </div>
        </div>
        <JobDetailActions 
          jobId={id} 
          hasSubscription={!!typedJob.stripe_subscription_id}
          setupFeeUrl={typedJob.setup_fee_payment_url}
          monthlyPaymentUrl={typedJob.monthly_payment_url}
        />
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-muted-foreground">
                {typedJob.customer?.first_name} {typedJob.customer?.last_name}
              </p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">{typedJob.customer?.email}</p>
            </div>
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">{typedJob.customer?.installation_address}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Current Status</p>
              <Badge className="mt-1" variant={getStatusVariant(typedJob.status)}>
                {typedJob.status.charAt(0).toUpperCase() + typedJob.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Created At</p>
              <p className="text-muted-foreground">
                {format(new Date(typedJob.created_at), "PPp")}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">
                {format(new Date(typedJob.updated_at), "PPp")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Setup Fee</p>
                <p className="text-muted-foreground">One-time installation fee</p>
              </div>
              <Badge variant="secondary" className="font-mono">
                <DollarSign className="mr-1 h-3 w-3" />
                {formatCurrency(typedJob.setup_fee)}
              </Badge>
            </div>
            {typedJob.setup_fee_payment_url && (
              <div className="mt-2">
                <PaymentLinkButton 
                  url={typedJob.setup_fee_payment_url}
                  label="View Setup Fee Invoice"
                />
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Rate</p>
                <p className="text-muted-foreground">Recurring monthly charge</p>
              </div>
              <Badge variant="secondary" className="font-mono">
                <DollarSign className="mr-1 h-3 w-3" />
                {formatCurrency(typedJob.monthly_rate)}
              </Badge>
            </div>
            {typedJob.monthly_payment_url && (
              <div className="mt-2">
                <PaymentLinkButton 
                  url={typedJob.monthly_payment_url}
                  label="View Monthly Invoice"
                />
              </div>
            )}
            
            {typedJob.stripe_subscription_id && (
              <div className="mt-4 rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Active Subscription</p>
                <p className="text-sm text-muted-foreground">
                  Monthly payments are automatically processed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Installation Date</p>
              <div className="flex items-center mt-1">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {typedJob.installation_date
                    ? format(new Date(typedJob.installation_date), "PPP")
                    : "Not scheduled"}
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium">Removal Date</p>
              <div className="flex items-center mt-1">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {typedJob.removal_date
                    ? format(new Date(typedJob.removal_date), "PPP")
                    : "Not scheduled"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Job Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <JobTimeline currentStatus={typedJob.status} events={timelineEvents} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notes</h3>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <AddNoteDialog jobId={id} />
                  </div>
                  {typedJob.notes && typedJob.notes.length > 0 ? (
                    <div className="space-y-4">
                      {typedJob.notes.map((note) => (
                        <div key={note.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              Added by {note.created_by}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(note.created_at), "PPp")}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">No notes yet</p>
                      <p className="text-sm text-muted-foreground">
                        Click the button above to add a note
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment History</h3>
                <PaymentHistory payments={typedJob.payments || []} />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Documents</h3>
                <JobDocuments jobId={id} documents={documents} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "draft":
      return "outline"
    case "quoted":
    case "approved":
      return "secondary"
    case "paid":
    case "scheduled":
    case "installed":
      return "default"
    case "completed":
      return "default"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
} 