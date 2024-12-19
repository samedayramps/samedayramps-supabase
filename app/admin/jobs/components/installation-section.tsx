"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InstallationDetails, Job } from "../types"
import { InstallationDetailsForm } from "./installation-details-form"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { updateInstallationDetails } from "../actions"
import { format } from "date-fns"

interface InstallationSectionProps {
  job: Job
  installationDetails?: InstallationDetails | null
}

export function InstallationSection({ job, installationDetails }: InstallationSectionProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (data: any) => {
    await updateInstallationDetails(job.id, data)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Installation Details</CardTitle>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
        </CardHeader>
        <CardContent>
          <InstallationDetailsForm
            jobId={job.id}
            initialData={installationDetails || undefined}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Installation Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
      </CardHeader>
      <CardContent>
        {installationDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Installation Team</h4>
                <p className="mt-1">
                  {installationDetails.installed_by?.join(", ") || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Equipment Used</h4>
                <p className="mt-1">
                  {installationDetails.equipment_used?.join(", ") || "Not specified"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Installation Time</h4>
                <div className="mt-1 space-y-1">
                  <p>Start: {installationDetails.installation_start ? 
                    format(new Date(installationDetails.installation_start), "PPp") : 
                    "Not started"}
                  </p>
                  <p>End: {installationDetails.installation_end ? 
                    format(new Date(installationDetails.installation_end), "PPp") : 
                    "Not completed"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Measurements</h4>
                <div className="mt-1 space-y-1">
                  <p>Length: {installationDetails.actual_length} ft</p>
                  <p>Rise: {installationDetails.actual_rise} inches</p>
                  <p>Sections: {installationDetails.number_of_sections}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Safety Checklist</h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${installationDetails.handrails_secure ? "bg-green-500" : "bg-red-500"}`} />
                  <span>Handrails Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${installationDetails.surface_stable ? "bg-green-500" : "bg-red-500"}`} />
                  <span>Surface Stable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${installationDetails.proper_slope ? "bg-green-500" : "bg-red-500"}`} />
                  <span>Proper Slope</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${installationDetails.platform_secure ? "bg-green-500" : "bg-red-500"}`} />
                  <span>Platform Secure</span>
                </div>
              </div>
            </div>

            {installationDetails.modifications_required && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Modifications</h4>
                <p className="mt-1">{installationDetails.modification_details}</p>
              </div>
            )}

            {installationDetails.photos && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Installation Photos</h4>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {Object.entries(installationDetails.photos).map(([type, urls]) => (
                    <div key={type}>
                      <h5 className="mb-2 capitalize">{type}</h5>
                      <div className="grid gap-2">
                        {urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${type} photo ${index + 1}`}
                            className="rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No installation details available</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              Add Installation Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 