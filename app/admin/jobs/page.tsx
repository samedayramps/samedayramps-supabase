import { Suspense } from "react"
import { JobsDataTable } from "./jobs-data-table"
import { columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateJobForm } from "./components/create-job-form"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"
import { getServiceSupabase } from "@/lib/supabase/service-role"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  console.log("Current user:", user);

  try {
    await requireRole(user.id, "admin");
    console.log("User has admin role");
  } catch (error) {
    console.error("Role check failed:", error);
    redirect("/unauthorized");
  }

  console.log('Fetching jobs...');
  const supabase = getServiceSupabase();
  
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      customer_id,
      status,
      setup_fee,
      monthly_rate,
      installation_date,
      removal_date,
      created_at,
      updated_at,
      customer:customers (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  console.log("Raw jobs data:", jobs);
  console.log("Number of jobs:", jobs?.length || 0);

  if (error) {
    console.error("Error fetching jobs:", error)
    return <div>Error loading jobs</div>
  }

  const { data: stats, error: statsError } = await supabase
    .from("jobs")
    .select("status")

  if (statsError) {
    console.error("Error fetching job stats:", statsError)
  } else {
    console.log("Fetched job stats:", stats)
  }

  const jobStats = stats?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  console.log("Computed job stats:", jobStats)

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">
            Manage your jobs and track their progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateJobForm />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobStats['active'] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobStats['completed'] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobStats['draft'] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <JobsClientWrapper initialJobs={jobs || []} />
    </div>
  )
}

function JobsClientWrapper({ initialJobs }: { initialJobs: any[] }) {
  return <JobsDataTable columns={columns} initialJobs={initialJobs} />
}

export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPage />
    </Suspense>
  )
} 