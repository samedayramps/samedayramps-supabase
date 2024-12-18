"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Job } from "./types"
import { Badge } from "@/components/ui/badge"
import { JobActions } from "./components/job-actions"
import { formatDate, formatCurrency } from "@/lib/utils"

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer
      return customer ? (
        <div className="flex flex-col">
          <span>{customer.first_name} {customer.last_name}</span>
          <span className="text-sm text-muted-foreground">{customer.email}</span>
        </div>
      ) : "-"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          className={
            status === "completed"
              ? "bg-green-500"
              : status === "cancelled"
              ? "bg-red-500"
              : "bg-yellow-500"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "setup_fee",
    header: "Setup Fee",
    cell: ({ row }) => formatCurrency(row.getValue("setup_fee")),
  },
  {
    accessorKey: "monthly_rate",
    header: "Monthly Rate",
    cell: ({ row }) => formatCurrency(row.getValue("monthly_rate")),
  },
  {
    accessorKey: "installation_date",
    header: "Installation Date",
    cell: ({ row }) => formatDate(row.getValue("installation_date")),
  },
  {
    accessorKey: "removal_date",
    header: "Removal Date",
    cell: ({ row }) => formatDate(row.getValue("removal_date")),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => <JobActions job={row.original} />,
  },
] 