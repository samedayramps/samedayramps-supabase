"use client"

import { Button } from "@/components/ui/button"
import { createSetupFeeInvoice, createMonthlyInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PricingActionsProps {
  jobId: string
  setupFee: number
  monthlyRate: number
  setupFeeUrl: string | null
  monthlyPaymentUrl: string | null
  hasSubscription: boolean
}

export function PricingActions({
  jobId,
  setupFee,
  monthlyRate,
  setupFeeUrl,
  monthlyPaymentUrl,
  hasSubscription
}: PricingActionsProps) {
  const router = useRouter()
  const [isSetupFeeLoading, setIsSetupFeeLoading] = useState(false)
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)

  const handleCreateSetupFeeInvoice = async () => {
    try {
      setIsSetupFeeLoading(true)
      await createSetupFeeInvoice(jobId)
      toast.success("Setup fee invoice created and sent")
      router.refresh()
    } catch (error) {
      console.error("Error creating setup fee invoice:", error)
      toast.error("Failed to create setup fee invoice")
    } finally {
      setIsSetupFeeLoading(false)
    }
  }

  const handleCreateMonthlyInvoice = async () => {
    try {
      setIsMonthlyLoading(true)
      await createMonthlyInvoice(jobId)
      toast.success("Monthly rental invoice created")
      router.refresh()
    } catch (error) {
      console.error("Error creating monthly invoice:", error)
      toast.error("Failed to create monthly invoice")
    } finally {
      setIsMonthlyLoading(false)
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
    <div className="flex items-center gap-2">
      {!setupFeeUrl && setupFee > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCreateSetupFeeInvoice}
          disabled={isSetupFeeLoading}
        >
          {isSetupFeeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Setup Fee Invoice
        </Button>
      )}
      {!monthlyPaymentUrl && monthlyRate > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCreateMonthlyInvoice}
          disabled={isMonthlyLoading}
        >
          {isMonthlyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Start Monthly Rental
        </Button>
      )}
      {hasSubscription && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCancelSubscription}
          disabled={isCancelLoading}
        >
          {isCancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cancel Subscription
        </Button>
      )}
    </div>
  )
} 