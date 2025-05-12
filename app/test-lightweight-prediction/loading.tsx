import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        <Skeleton className="h-40 w-full mb-8" />

        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
