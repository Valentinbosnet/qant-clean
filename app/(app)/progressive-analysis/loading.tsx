import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProgressiveAnalysisLoading() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <Skeleton className="h-24 w-full mb-6" />

      <div className="mb-6">
        <Skeleton className="h-10 w-full" />
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-gray-700" />
          <Skeleton className="h-4 w-32 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full bg-gray-700" />
              <Skeleton className="h-20 w-full bg-gray-700" />
            </div>
            <Skeleton className="h-6 w-48 bg-gray-700" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full bg-gray-700" />
              <Skeleton className="h-24 w-full bg-gray-700" />
              <Skeleton className="h-24 w-full bg-gray-700" />
            </div>
            <Skeleton className="h-32 w-full bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
