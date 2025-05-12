import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  )
}
