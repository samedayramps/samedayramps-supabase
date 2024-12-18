"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Job } from "../types"

interface TimelineEvent {
  status: Job["status"]
  date: string
  description: string
}

interface JobTimelineProps {
  currentStatus: Job["status"]
  events: TimelineEvent[]
}

const statusOrder: Job["status"][] = [
  "draft",
  "quoted",
  "approved",
  "paid",
  "scheduled",
  "installed",
  "completed",
]

export function JobTimeline({ currentStatus, events }: JobTimelineProps) {
  const getStatusIndex = (status: Job["status"]) => statusOrder.indexOf(status)
  const currentStatusIndex = getStatusIndex(currentStatus)

  return (
    <div className="space-y-4">
      <div className="relative">
        {statusOrder.map((status, index) => {
          const event = events.find((e) => e.status === status)
          const isCompleted = getStatusIndex(status) <= currentStatusIndex
          const isLast = index === statusOrder.length - 1

          return (
            <div key={status} className="flex items-start mb-6 last:mb-0">
              <div className="flex items-center">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "font-medium",
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                  {event && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.date), "PPp")}
                    </p>
                  )}
                </div>
                {event && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-2.5 ml-px w-[1px] h-full",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  style={{ top: "24px" }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 