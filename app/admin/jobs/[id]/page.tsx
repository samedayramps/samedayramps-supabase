import { getServiceSupabase } from "@/lib/supabase/service-role"
import { notFound } from "next/navigation"
import { JobDetailActions } from "../components/job-detail-actions"
import PricingSection from "../components/pricing-section"
import { JobStatusOverview } from "../components/job-status-overview"
import { PaymentHistory } from "../components/payment-history"
import { AddNoteDialog } from "../components/add-note-dialog"
import { JobDocuments } from "../components/job-documents"
import { CustomerSidebar } from "../components/customer-sidebar"
import { Job, JobNote } from "../types"
import { InstallationSection } from "../components/installation-section"
import { RentalAgreementSection } from "../components/rental-agreement-section"

// Add type for documents if not already defined in types.ts
interface JobDocument {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploaded_at: string
}

// Extend the job type to include documents
interface ExtendedJob extends Job {
  documents?: JobDocument[]
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the params promise
  const supabase = getServiceSupabase();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      customer:customers(*),
      locations:job_locations(*),
      payments:job_payments(*),
      notes:job_notes(*),
      installation_details:installation_details(*),
      rental_agreements(*)
    `)
    .eq("id", resolvedParams.id) // Use resolvedParams.id
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Job #{resolvedParams.id}</h1> {/* Use resolvedParams.id */}
            <p className="text-sm text-muted-foreground">
              Created {new Date(job.created_at).toLocaleDateString()} by Admin
            </p>
          </div>
          <JobDetailActions jobId={job.id} status={job.status} />
        </div>

        <JobStatusOverview job={job} />

        <PricingSection 
          jobId={job.id}
          setupFee={job.setup_fee}
          monthlyRate={job.monthly_rate}
          setupFeeUrl={job.setup_fee_payment_url}
          monthlyPaymentUrl={job.monthly_payment_url}
          hasSubscription={!!job.stripe_subscription_id}
        />
        <RentalAgreementSection 
          jobId={job.id}
          customer={job.customer}
          agreementStatus={job.rental_agreements?.[0]}
        />

        <InstallationSection 
          job={job}
          installationDetails={job.installation_details}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Notes & Updates</h2>
              <AddNoteDialog jobId={job.id} />
            </div>
            {job.notes && job.notes.length > 0 ? (
              <div className="space-y-4">
                {job.notes.map((note: JobNote) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Documents</h2>
              <JobDocuments 
                jobId={job.id} 
                documents={job.documents || []} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 