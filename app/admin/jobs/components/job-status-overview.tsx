"use client"

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Job } from "../types"
import { 
  CalendarCheck, 
  CreditCard, 
  FileCheck, 
  Truck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JobStatusOverviewProps {
  job: Job & {
    locations?: Array<{
      type: "installation" | "removal"
      completed_date: string | null
      scheduled_date: string | null
    }>
    payments?: Array<{
      type: "setup" | "monthly"
      status: "pending" | "paid" | "refunded"
      created_at: string
    }>
  }
}

type StatusType = "success" | "warning" | "error" | "default"

interface StatusIndicator {
  label: string
  status: StatusType
  message: string
  icon: React.ReactNode
  date?: string
}

export function JobStatusOverview({ job }: JobStatusOverviewProps) {
  // Helper function to determine setup fee status
  const getSetupFeeStatus = (): StatusIndicator => {
    const setupPayment = job.payments?.find(p => p.type === "setup")
    
    if (!job.setup_fee) {
      return {
        label: "Setup Fee",
        status: "default",
        message: "No setup fee required",
        icon: <Ban className="h-4 w-4" />
      }
    }
    
    if (setupPayment?.status === "paid") {
      return {
        label: "Setup Fee",
        status: "success",
        message: "Payment received",
        icon: <CheckCircle2 className="h-4 w-4" />,
        date: setupPayment.created_at
      }
    }

    if (setupPayment?.status === "pending") {
      return {
        label: "Setup Fee",
        status: "warning",
        message: "Awaiting payment",
        icon: <Clock className="h-4 w-4" />,
        date: setupPayment.created_at
      }
    }

    return {
      label: "Setup Fee",
      status: "default",
      message: formatCurrency(job.setup_fee) + " - Not invoiced",
      icon: <DollarSign className="h-4 w-4" />
    }
  }

  // Helper function to determine subscription status
  const getSubscriptionStatus = (): StatusIndicator => {
    if (!job.monthly_rate) {
      return {
        label: "Monthly Rental",
        status: "default",
        message: "No monthly rental fee",
        icon: <Ban className="h-4 w-4" />
      }
    }

    if (job.stripe_subscription_id) {
      return {
        label: "Monthly Rental",
        status: "success",
        message: formatCurrency(job.monthly_rate) + "/month - Active",
        icon: <CheckCircle2 className="h-4 w-4" />
      }
    }

    return {
      label: "Monthly Rental",
      status: "default",
      message: formatCurrency(job.monthly_rate) + "/month - Not started",
      icon: <DollarSign className="h-4 w-4" />
    }
  }

  // Helper function to determine installation status
  const getInstallationStatus = (): StatusIndicator => {
    const installLocation = job.locations?.find(l => l.type === "installation")

    if (installLocation?.completed_date) {
      return {
        label: "Installation",
        status: "success",
        message: "Completed",
        icon: <CheckCircle2 className="h-4 w-4" />,
        date: installLocation.completed_date
      }
    }

    if (job.installation_date) {
      return {
        label: "Installation",
        status: "warning",
        message: "Scheduled",
        icon: <CalendarCheck className="h-4 w-4" />,
        date: job.installation_date
      }
    }

    return {
      label: "Installation",
      status: "default",
      message: "Not scheduled",
      icon: <Truck className="h-4 w-4" />
    }
  }

  // Helper function to determine removal status
  const getRemovalStatus = (): StatusIndicator => {
    const removalLocation = job.locations?.find(l => l.type === "removal")

    if (removalLocation?.completed_date) {
      return {
        label: "Removal",
        status: "success",
        message: "Completed",
        icon: <CheckCircle2 className="h-4 w-4" />,
        date: removalLocation.completed_date
      }
    }

    if (job.removal_date) {
      return {
        label: "Removal",
        status: "warning",
        message: "Scheduled",
        icon: <CalendarCheck className="h-4 w-4" />,
        date: job.removal_date
      }
    }

    return {
      label: "Removal",
      status: "default",
      message: "Not scheduled",
      icon: <Truck className="h-4 w-4" />
    }
  }

  const statusIndicators = [
    getSetupFeeStatus(),
    getSubscriptionStatus(),
    getInstallationStatus(),
    getRemovalStatus(),
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statusIndicators.map((indicator, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4",
            indicator.status === "success" && "bg-green-50/50 border-green-100",
            indicator.status === "warning" && "bg-yellow-50/50 border-yellow-100",
            indicator.status === "error" && "bg-red-50/50 border-red-100"
          )}
        >
          <div className={cn(
            "mt-0.5 rounded-full p-1.5",
            indicator.status === "success" && "bg-green-100 text-green-600",
            indicator.status === "warning" && "bg-yellow-100 text-yellow-600",
            indicator.status === "error" && "bg-red-100 text-red-600",
            indicator.status === "default" && "bg-gray-100 text-gray-600"
          )}>
            {indicator.icon}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">{indicator.label}</p>
            <p className="text-sm text-muted-foreground">
              {indicator.message}
            </p>
            {indicator.date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(indicator.date), "PPP")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
} 