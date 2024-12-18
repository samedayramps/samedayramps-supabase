"use client"

import { RentalRequest } from "@/app/admin/crm/types"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UpdateStatusDialog } from "./update-status-dialog"

interface ActionMenuItemsProps {
  lead: RentalRequest
  onClose?: () => void
}

export function ActionMenuItems({ lead, onClose }: ActionMenuItemsProps) {
  const { toast } = useToast()

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
    onClose?.()
  }

  return (
    <>
      <DropdownMenuItem
        onClick={() => handleCopy(lead.email, "Email")}
        className="cursor-pointer"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy email
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleCopy(lead.phone, "Phone number")}
        className="cursor-pointer"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy phone
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <UpdateStatusDialog
          lead={lead}
          trigger={
            <button className="w-full text-left cursor-pointer hover:bg-muted transition-colors flex items-center">
              Update status
            </button>
          }
          onStatusUpdate={() => {
            window.location.reload()
          }}
        />
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        View details
      </DropdownMenuItem>
    </>
  )
} 