"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createJobInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, Send, Ban, Edit, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface JobDetailActionsProps {
  jobId: string
  hasSubscription: boolean
  setupFeeUrl: string | null
  monthlyPaymentUrl: string | null
  isTestMode?: boolean
}

// Add a test mode indicator
function TestModeIndicator() {
  return (
    <div className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
      Test Mode
    </div>
  );
}

export function JobDetailActions({ 
  jobId, 
  hasSubscription, 
  setupFeeUrl,
  monthlyPaymentUrl,
  isTestMode = true
}: JobDetailActionsProps) {
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const router = useRouter()

  const handleCreateInvoice = async () => {
    try {
      setIsInvoiceLoading(true)
      const result = await createJobInvoice(jobId)
      toast.success("Invoice created and sent successfully", {
        description: "The customer will receive an email with payment instructions."
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsInvoiceLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCancelLoading(true)
      await cancelJobSubscription(jobId)
      toast.success("Subscription cancelled successfully")
      router.refresh()
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast.error("Failed to cancel subscription")
    } finally {
      setIsCancelLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {isTestMode && <TestModeIndicator />}
      <div className="flex items-center space-x-2">
        {setupFeeUrl ? (
          <Button 
            variant="outline"
            onClick={() => window.open(setupFeeUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Setup Fee Invoice
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={handleCreateInvoice}
            disabled={isInvoiceLoading}
          >
            {isInvoiceLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Invoice
          </Button>
        )}

        {monthlyPaymentUrl && (
          <Button 
            variant="outline"
            onClick={() => window.open(monthlyPaymentUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Monthly Invoice
          </Button>
        )}

        {hasSubscription && (
          <Button 
            variant="outline"
            onClick={handleCancelSubscription}
            disabled={isCancelLoading}
          >
            {isCancelLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel Subscription
          </Button>
        )}
        <Link href={`/admin/jobs/${jobId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
        </Link>
      </div>
    </div>
  )
} 