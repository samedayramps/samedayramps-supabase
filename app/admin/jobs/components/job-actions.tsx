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
import { createSetupFeeInvoice, createMonthlyInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { Job } from "../types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobActionsProps {
  job: Job
}

export function JobActions({ job }: JobActionsProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteJobs([job.id])
      toast.success("Job deleted successfully")
      router.push("/admin/jobs")
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

  const handleCreateSetupFeeInvoice = async () => {
    try {
      await createSetupFeeInvoice(job.id)
      toast.success("Setup fee invoice created and sent")
    } catch (error) {
      console.error("Error creating setup fee invoice:", error)
      toast.error("Failed to create setup fee invoice")
    }
  }

  const handleCreateMonthlyInvoice = async () => {
    try {
      await createMonthlyInvoice(job.id)
      toast.success("Monthly rental invoice created")
    } catch (error) {
      console.error("Error creating monthly invoice:", error)
      toast.error("Failed to create monthly invoice")
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
        <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate("cancelled")}>
          Mark as Cancelled
        </DropdownMenuItem>
        {job.setup_fee > 0 && !job.setup_fee_payment_url && (
          <DropdownMenuItem onClick={handleCreateSetupFeeInvoice}>
            Send Setup Fee Invoice
          </DropdownMenuItem>
        )}
        {job.monthly_rate > 0 && !job.monthly_payment_url && (
          <DropdownMenuItem onClick={handleCreateMonthlyInvoice}>
            Start Monthly Rental
          </DropdownMenuItem>
        )}
        {job.stripe_subscription_id && (
          <DropdownMenuItem onClick={handleCancelSubscription}>
            Cancel Subscription
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 