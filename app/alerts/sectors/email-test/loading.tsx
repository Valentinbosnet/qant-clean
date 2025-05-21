import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="max-w-md mx-auto">
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    </div>
  )
}
