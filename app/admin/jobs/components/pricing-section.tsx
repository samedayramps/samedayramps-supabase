"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { createSetupFeeInvoice, createMonthlyInvoice, cancelJobSubscription } from "../actions/stripe-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Send, Ban, ExternalLink, AlertCircle, CreditCard, CheckCircle2, Clock, Pencil } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { updateJob } from "../actions"

interface PricingSectionProps {
  jobId: string
  setupFee: number
  monthlyRate: number
  setupFeeUrl: string | null
  monthlyPaymentUrl: string | null
  hasSubscription: boolean
}

export default function PricingSection({
  jobId,
  setupFee,
  monthlyRate,
  setupFeeUrl,
  monthlyPaymentUrl,
  hasSubscription
}: PricingSectionProps) {
  const router = useRouter()
  const [isSetupFeeLoading, setIsSetupFeeLoading] = useState(false)
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const [isEditingSetupFee, setIsEditingSetupFee] = useState(false)
  const [isEditingMonthlyRate, setIsEditingMonthlyRate] = useState(false)
  const [newSetupFee, setNewSetupFee] = useState(setupFee)
  const [newMonthlyRate, setNewMonthlyRate] = useState(monthlyRate)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleUpdateSetupFee = async () => {
    try {
      setIsUpdating(true)
      await updateJob(jobId, { setup_fee: newSetupFee })
      toast.success("Setup fee updated successfully")
      setIsEditingSetupFee(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating setup fee:", error)
      toast.error("Failed to update setup fee")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateMonthlyRate = async () => {
    try {
      setIsUpdating(true)
      await updateJob(jobId, { monthly_rate: newMonthlyRate })
      toast.success("Monthly rate updated successfully")
      setIsEditingMonthlyRate(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating monthly rate:", error)
      toast.error("Failed to update monthly rate")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Setup Fee */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Setup Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsEditingSetupFee(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(setupFee)}
                </Badge>
              </div>
            </div>
            
            {setupFee > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {setupFeeUrl ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Invoice sent</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">Not invoiced</span>
                    </>
                  )}
                </div>
                {setupFeeUrl ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(setupFeeUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full"
                    onClick={handleCreateSetupFeeInvoice}
                    disabled={isSetupFeeLoading}
                  >
                    {isSetupFeeLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Invoice
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ban className="h-4 w-4" />
                <span>No setup fee required</span>
              </div>
            )}
          </div>

          {/* Monthly Rate */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Monthly Rental</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsEditingMonthlyRate(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(monthlyRate)}/mo
                </Badge>
              </div>
            </div>
            
            {monthlyRate > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {hasSubscription ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Subscription active</span>
                    </>
                  ) : monthlyPaymentUrl ? (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">Invoice sent</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">Not started</span>
                    </>
                  )}
                </div>
                {monthlyPaymentUrl ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(monthlyPaymentUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                ) : !hasSubscription && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full"
                    onClick={handleCreateMonthlyInvoice}
                    disabled={isMonthlyLoading}
                  >
                    {isMonthlyLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Start Monthly Rental
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ban className="h-4 w-4" />
                <span>No monthly rental fee</span>
              </div>
            )}
          </div>
        </div>

        {hasSubscription && (
          <>
            <Separator />
            <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Active Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      Monthly payments are automatically processed
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={isCancelLoading}
                  className="border-yellow-200 hover:bg-yellow-100"
                >
                  {isCancelLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="mr-2 h-4 w-4" />
                  )}
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Setup Fee Edit Dialog */}
      <Dialog open={isEditingSetupFee} onOpenChange={setIsEditingSetupFee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setup Fee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={newSetupFee}
              onChange={(e) => setNewSetupFee(Number(e.target.value))}
              placeholder="Enter setup fee..."
              min={0}
              step={0.01}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewSetupFee(setupFee)
                setIsEditingSetupFee(false)
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSetupFee}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Monthly Rate Edit Dialog */}
      <Dialog open={isEditingMonthlyRate} onOpenChange={setIsEditingMonthlyRate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Monthly Rate</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={newMonthlyRate}
              onChange={(e) => setNewMonthlyRate(Number(e.target.value))}
              placeholder="Enter monthly rate..."
              min={0}
              step={0.01}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewMonthlyRate(monthlyRate)
                setIsEditingMonthlyRate(false)
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateMonthlyRate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 