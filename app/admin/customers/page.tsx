import { Suspense } from "react"
import { CustomersDataTable } from "./customers-data-table"
import { columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateCustomerForm } from "./components/create-customer-form"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"
import { getServiceSupabase } from "@/lib/supabase/service-role"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function CustomersPage() {
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

  const supabase = getServiceSupabase();
  
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  console.log("Customers query result:", { data: customers, error });

  if (error) {
    console.error("Error fetching customers:", error)
    return <div>Error loading customers</div>
  }

  const { data: stats, error: statsError } = await supabase
    .from("customers")
    .select("id")

  if (statsError) {
    console.error("Error fetching customer stats:", statsError)
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customers and their information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateCustomerForm />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <CustomersClientWrapper initialCustomers={customers || []} />
    </div>
  )
}

function CustomersClientWrapper({ initialCustomers }: { initialCustomers: any[] }) {
  return <CustomersDataTable columns={columns} initialCustomers={initialCustomers} />
}

export default function CustomersPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersPage />
    </Suspense>
  )
} 