import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 w-full px-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[100px]" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
      </div>
    </div>
  )
}  