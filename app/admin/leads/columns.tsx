"use client"

import { ColumnDef } from "@tanstack/react-table"
import { RentalRequest } from "@/app/admin/crm/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Phone, Copy, Check } from "lucide-react"
import Link from "next/link"
import { UpdateStatusDialog } from "./update-status-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { ActionMenuItems } from "./action-menu-items"

// Helper component for copy functionality
function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 p-2 hover:bg-muted"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

// Actions menu component
function ActionsMenu({ lead }: { lead: RentalRequest }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 hover:bg-muted transition-colors"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ActionMenuItems lead={lead} onClose={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<RentalRequest>[] = [
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="font-medium">
          {lead.first_name} {lead.last_name}
        </div>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    enableHiding: true,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    enableHiding: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="flex items-center space-x-2">
          <Link 
            href={`mailto:${email}`} 
            className="flex items-center hover:underline text-blue-600 hover:text-blue-800 transition-colors truncate"
          >
            <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="hidden md:block">{email}</span>
            <span className="md:hidden">{email.split('@')[0]}</span>
          </Link>
          <CopyButton text={email} label="Email" />
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return (
        <div className="flex items-center space-x-2">
          <Link 
            href={`tel:${phone}`} 
            className="flex items-center hover:underline text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{phone}</span>
          </Link>
          <CopyButton text={phone} label="Phone number" />
        </div>
      )
    },
  },
  {
    accessorKey: "urgency",
    header: "Urgency",
    cell: ({ row }) => {
      const urgency = row.getValue("urgency") as string
      return (
        <Badge 
          variant={urgency as "high" | "medium" | "low"}
          className="capitalize whitespace-nowrap"
        >
          {urgency}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const lead = row.original
      const status = lead.status

      return (
        <UpdateStatusDialog
          lead={lead}
          trigger={
            <Badge
              variant={status}
              className="cursor-pointer hover:scale-105 transition-transform capitalize whitespace-nowrap"
            >
              {status}
            </Badge>
          }
        />
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsMenu lead={row.original} />,
  },
] 