"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Send, Eye, CheckCircle2, Clock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { sendRentalAgreement } from "../actions"

interface RentalAgreementSectionProps {
  jobId: string
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  agreementStatus?: {
    sent_at?: string
    signed_at?: string
    sign_page_url?: string
    status?: "pending" | "sent" | "viewed" | "signed"
  }
}

export function RentalAgreementSection({ jobId, customer, agreementStatus }: RentalAgreementSectionProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendAgreement = async () => {
    try {
      setIsSending(true)
      await sendRentalAgreement(jobId, {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone
      })
      toast.success("Rental agreement sent successfully")
    } catch (error) {
      toast.error("Failed to send rental agreement")
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const getStatusDisplay = () => {
    if (!agreementStatus) {
      return {
        icon: <FileText className="h-4 w-4" />,
        text: "Not sent",
        color: "text-muted-foreground"
      }
    }

    switch (agreementStatus.status) {
      case "signed":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          text: "Signed",
          color: "text-green-500"
        }
      case "viewed":
        return {
          icon: <Eye className="h-4 w-4" />,
          text: "Viewed",
          color: "text-blue-500"
        }
      case "sent":
        return {
          icon: <Clock className="h-4 w-4" />,
          text: "Pending signature",
          color: "text-orange-500"
        }
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          text: "Not sent",
          color: "text-muted-foreground"
        }
    }
  }

  const status = getStatusDisplay()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Rental Agreement</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${status.color}`}>
            {status.icon}
            <span className="text-sm">{status.text}</span>
          </div>
          {(!agreementStatus || !agreementStatus.signed_at) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSendAgreement}
              disabled={isSending}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Agreement"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {agreementStatus?.sign_page_url && (
          <div className="mt-4">
            <iframe
              src={`${agreementStatus.sign_page_url}?embedded=yes`}
              className="w-full min-h-[500px] border rounded-md"
              title="Rental Agreement"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 