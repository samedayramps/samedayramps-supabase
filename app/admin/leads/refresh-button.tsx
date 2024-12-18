"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useLeadsStore } from "./use-leads-store"
import { getRentalRequests } from "@/app/admin/crm/actions"

export function RefreshButton() {
  const setLeads = useLeadsStore((state) => state.setLeads)

  const handleRefresh = async () => {
    // Clear the store first
    setLeads([])
    
    const { data } = await getRentalRequests()
    if (data) {
      setLeads(data)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </Button>
  )
} 