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
import { deleteCustomers, updateCustomer } from "../actions"
import { Customer } from "../types"
import { toast } from "sonner"

interface CustomerActionsProps {
  customer: Customer
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const handleDelete = async () => {
    try {
      await deleteCustomers([customer.id])
      toast.success("Customer deleted successfully")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  const handleStatusUpdate = async (status: Customer["status"]) => {
    try {
      await updateCustomer(customer.id, { status })
      toast.success(`Customer marked as ${status}`)
    } catch (error) {
      console.error("Error updating customer status:", error)
      toast.error("Failed to update customer status")
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
          onClick={() => handleStatusUpdate("active")}
        >
          Mark as Active
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("inactive")}
        >
          Mark as Inactive
        </DropdownMenuItem>
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