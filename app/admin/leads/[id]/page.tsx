import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { formatDate } from "@/lib/utils"
import { LeadStatus, LeadUrgency } from "../../crm/types"
import { getServiceSupabase } from "@/lib/supabase/service-role"
import { getCurrentUser } from "@/features/auth/utils/auth-utils"
import { requireRole } from "@/features/auth/utils/role-utils"
import { redirect } from "next/navigation"

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  const { data: lead, error } = await supabase
    .from("rental_requests")
    .select(`
      *,
      customer:customers(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error('LeadPage: Supabase error:', error)
    throw error
  }

  if (!lead) {
    console.log('LeadPage: No lead found with ID:', id)
    notFound()
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admin/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lead Details</h2>
            <p className="text-muted-foreground">
              View and manage lead information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/admin/leads/${id}/edit`}>
            <Button>Edit Lead</Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-muted-foreground">
                {lead.first_name} {lead.last_name}
              </p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${lead.email}`}
                  className="text-muted-foreground hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${lead.phone}`}
                  className="text-muted-foreground hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium">Installation Address</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {lead.installation_address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Current Status</p>
              <Badge className="mt-1" variant={getStatusVariant(lead.status)}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Urgency</p>
              <Badge className="mt-1" variant={getUrgencyVariant(lead.urgency)}>
                {lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Created At</p>
              <p className="text-muted-foreground">
                {format(new Date(lead.created_at), "PPp")}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">
                {format(new Date(lead.updated_at), "PPp")}
              </p>
            </div>
          </CardContent>
        </Card>

        {lead.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Additional Information</p>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {lead.customer && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-muted-foreground">
                      {lead.customer.first_name} {lead.customer.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{lead.customer.email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{lead.customer.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge variant={lead.customer.status === "active" ? "default" : "secondary"}>
                      {lead.customer.status.charAt(0).toUpperCase() + lead.customer.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function getStatusVariant(status: LeadStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "new":
      return "outline"
    case "contacted":
    case "quoted":
      return "secondary"
    case "closed":
      return "default"
    case "lost":
      return "destructive"
    default:
      return "outline"
  }
}

function getUrgencyVariant(urgency: LeadUrgency): "default" | "secondary" | "destructive" {
  switch (urgency) {
    case "low":
      return "secondary"
    case "medium":
      return "default"
    case "high":
      return "destructive"
    default:
      return "default"
  }
} 