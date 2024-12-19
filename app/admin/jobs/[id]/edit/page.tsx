import { Suspense } from "react"
import { EditJobForm } from "./edit-job-form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServiceSupabase } from "@/lib/supabase/service-role"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
        email,
        phone,
        installation_address,
        city,
        state,
        zip_code,
        status,
        created_at,
        updated_at
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (error) {
    console.error("Error fetching job:", error);
    throw new Error("Failed to load job")
  }

  if (!job) {
    notFound()
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

      <Suspense fallback={<div>Loading form...</div>}>
        <EditJobForm job={job} />
      </Suspense>
    </div>
  )
} 