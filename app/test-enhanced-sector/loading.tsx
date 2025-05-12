import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-10 w-3/4 mb-8" />
      <Skeleton className="h-6 w-full mb-8" />

      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
