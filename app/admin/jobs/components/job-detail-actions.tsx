"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { Edit, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateJob } from "../actions"
import { Job, JobStatus } from "../types"

interface JobDetailActionsProps {
  jobId: string
  status: JobStatus
}

export function JobDetailActions({ 
  jobId,
  status,
}: JobDetailActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    try {
      setIsLoading(true)
      await updateJob(jobId, { status: newStatus })
      toast.success(`Job marked as ${newStatus}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating job status:", error)
      toast.error("Failed to update job status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/jobs/${jobId}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Job
        </Link>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("completed")}
            disabled={status === "completed"}
          >
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("cancelled")}
            disabled={status === "cancelled"}
          >
            Mark as Cancelled
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/admin/jobs/${jobId}/edit`)}
          >
            Edit Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 