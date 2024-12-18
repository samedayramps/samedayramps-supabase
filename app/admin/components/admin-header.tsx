"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLeadsStore } from "../leads/use-leads-store"

export function AdminHeader() {
  const router = useRouter()
  const setLeads = useLeadsStore((state) => state.setLeads)

  const handleClearCache = () => {
    // Clear Zustand store
    setLeads([])
    
    // Clear router cache and refresh
    router.refresh()
    
    // Force a hard reload of the page
    window.location.reload()
  }

  return (
    <div className="flex items-center justify-between border-b px-6 py-3">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearCache}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Clear Cache
      </Button>
    </div>
  )
} 