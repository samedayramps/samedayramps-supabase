"use client"

import { Customer, Job } from "../types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Pencil } from "lucide-react"
import { format } from "date-fns"

interface CustomerSidebarProps {
  customer: Customer
  job: Job
}

export function CustomerSidebar({ customer, job }: CustomerSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Customer Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Customer Details</h2>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/admin/customers/${customer.id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Profile
            </a>
          </Button>
        </div>
        <Card>
          <div className="divide-y">
            <div className="p-4 space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p>{customer.first_name} {customer.last_name}</p>
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Installation Address</h3>
              <p>{customer.installation_address}</p>
              <p>{customer.city}, {customer.state} {customer.zip_code}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 