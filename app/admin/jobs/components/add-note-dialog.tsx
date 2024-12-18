"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AddNoteDialogProps {
  jobId: string
}

export function AddNoteDialog({ jobId }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Note content cannot be empty")
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from("job_notes")
        .insert([
          {
            job_id: jobId,
            content: content.trim(),
            created_by: "Admin", // TODO: Replace with actual user
          },
        ])

      if (error) throw error

      toast.success("Note added successfully")
      setOpen(false)
      setContent("")
      router.refresh()
    } catch (error) {
      toast.error("Failed to add note")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to this job. Notes help track important information and updates.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 