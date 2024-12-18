"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { updateRentalRequest } from "@/app/admin/crm/actions"
import { RentalRequest } from "@/app/admin/crm/types"
import { useToast } from "@/components/ui/use-toast"
import { useLeadsStore } from "./use-leads-store"

const leadStatuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
] as const

interface UpdateStatusDialogProps {
  lead: RentalRequest
  trigger?: React.ReactNode
  onStatusUpdate?: () => void
}

export function UpdateStatusDialog({ 
  lead, 
  trigger,
  onStatusUpdate 
}: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string>(lead.status)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const updateLead = useLeadsStore((state) => state.updateLead)

  const handleUpdateStatus = async () => {
    setIsLoading(true)
    try {
      // Optimistically update the UI
      updateLead(lead.id, { status: status as RentalRequest['status'] })
      
      // Make the API call
      const { error } = await updateRentalRequest(lead.id, { status: status as RentalRequest['status'] })
      if (error) throw new Error(error)
      
      toast({
        title: "Status updated",
        description: `Lead status updated to ${status}`,
      })
      onStatusUpdate?.()
      setOpen(false)
    } catch (error) {
      // Revert the optimistic update on error
      updateLead(lead.id, { status: lead.status })
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Update Status</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isLoading || status === lead.status}
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 