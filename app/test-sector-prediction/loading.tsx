import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-4 w-full max-w-2xl mb-6" />

      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </div>
  )
}
