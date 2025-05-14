import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-x-2">
          <Skeleton className="h-10 w-10 inline-block rounded-md" />
          <Skeleton className="h-10 w-10 inline-block rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
