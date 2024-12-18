"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Customer } from "./types"
import { Badge } from "@/components/ui/badge"
import { CustomerActions } from "./components/customer-actions"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          className={
            status === "active"
              ? "bg-green-500"
              : status === "inactive"
              ? "bg-gray-500"
              : "bg-yellow-500"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
] 