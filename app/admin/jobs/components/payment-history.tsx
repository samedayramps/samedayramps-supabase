"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { JobPayment } from "../types"

interface PaymentHistoryProps {
  payments: JobPayment[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getPaymentStatusColor = (status: JobPayment["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "paid":
        return "default"
      case "refunded":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No payment history available
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.created_at), "PPp")}
                </TableCell>
                <TableCell className="capitalize">{payment.type}</TableCell>
                <TableCell className="font-mono">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {payment.stripe_payment_id || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 