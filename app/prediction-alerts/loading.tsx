import { Skeleton } from "@/components/ui/skeleton"

export default function PredictionAlertsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 rounded-full mr-2" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-sm mb-6" />

            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
