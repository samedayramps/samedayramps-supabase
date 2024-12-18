import { LeadsDataTable } from "./leads-data-table"
import { columns } from "./columns"
import { getRentalRequests } from "@/app/admin/crm/actions"
import { Suspense } from "react"
import { LeadsInitializer } from "./leads-initializer"
import { RefreshButton } from "./refresh-button"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function LeadsContent() {
  const { data: leads, error } = await getRentalRequests()
  
  console.log('LeadsContent: Fetched leads:', { leads, error })
  
  if (error) {
    return <div>Error loading leads: {error}</div>
  }

  return (
    <div className="space-y-4">
      <LeadsInitializer leads={leads || []} />
      <LeadsDataTable columns={columns} />
    </div>
  )
}

export default function LeadsPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
        <RefreshButton />
      </div>
      
      <Suspense fallback={<div>Loading leads...</div>}>
        <LeadsContent />
      </Suspense>
    </div>
  )
} 