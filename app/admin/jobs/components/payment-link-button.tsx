"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface PaymentLinkButtonProps {
  url: string
  label: string
}

export function PaymentLinkButton({ url, label }: PaymentLinkButtonProps) {
  return (
    <Button
      variant="link"
      className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
      onClick={() => window.open(url, '_blank')}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
} 