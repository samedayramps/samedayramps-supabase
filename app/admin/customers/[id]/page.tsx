import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { formatDate } from "@/lib/utils"
import { getServiceSupabase } from "@/lib/supabase/service-role"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerPage({ params }: PageProps) {
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
  
  const { data: customer, error } = await supabase
    .from("customers")
    .select(`
      *,
      jobs:jobs(*)
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (error) {
    console.error('CustomerPage: Supabase error:', error)
    throw error
  }

  if (!customer) {
    console.log('CustomerPage: No customer found with ID:', resolvedParams.id)
    notFound()
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Details</h2>
            <p className="text-muted-foreground">
              View and manage customer information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/admin/customers/${resolvedParams.id}/edit`}>
            <Button>Edit Customer</Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-muted-foreground">
                {customer.first_name} {customer.last_name}
              </p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${customer.email}`}
                  className="text-muted-foreground hover:underline"
                >
                  {customer.email}
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${customer.phone}`}
                  className="text-muted-foreground hover:underline"
                >
                  {customer.phone || "Not provided"}
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">{customer.address || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Status</p>
              <Badge className="mt-1" variant={customer.status === "active" ? "default" : "secondary"}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Created At</p>
              <p className="text-muted-foreground">
                {format(new Date(customer.created_at), "PPp")}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">
                {format(new Date(customer.updated_at), "PPp")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.jobs && customer.jobs.length > 0 ? (
              <div className="space-y-4">
                {customer.jobs.map((job: any) => (
                  <Link 
                    key={job.id} 
                    href={`/admin/jobs/${job.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getJobStatusVariant(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(job.created_at)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Setup Fee</p>
                          <p className="text-sm text-muted-foreground">
                            ${job.setup_fee.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Monthly Rate</p>
                          <p className="text-sm text-muted-foreground">
                            ${job.monthly_rate.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Installation Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(job.installation_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Removal Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(job.removal_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No jobs found for this customer
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getJobStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
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