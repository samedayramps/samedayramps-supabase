"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deleteJobs, updateJob } from "../actions"
import { createJobInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { Job } from "../types"
import { toast } from "sonner"

interface JobActionsProps {
  job: Job
}

export function JobActions({ job }: JobActionsProps) {
  const handleDelete = async () => {
    try {
      await deleteJobs([job.id])
      toast.success("Job deleted successfully")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job")
    }
  }

  const handleStatusUpdate = async (status: Job["status"]) => {
    try {
      await updateJob(job.id, { status })
      toast.success(`Job marked as ${status}`)
    } catch (error) {
      console.error("Error updating job status:", error)
      toast.error("Failed to update job status")
    }
  }

  const handleCreateInvoice = async () => {
    try {
      await createJobInvoice(job.id)
      toast.success("Invoice created and sent successfully")
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice")
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelJobSubscription(job.id)
      toast.success("Subscription cancelled successfully")
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast.error("Failed to cancel subscription")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("completed")}
        >
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("cancelled")}
        >
          Mark as Cancelled
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCreateInvoice}
        >
          Send Invoice
        </DropdownMenuItem>
        {job.stripe_subscription_id && (
          <DropdownMenuItem
            onClick={handleCancelSubscription}
          >
            Cancel Subscription
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 