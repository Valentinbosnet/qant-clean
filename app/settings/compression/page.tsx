"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the component with SSR disabled
const CompressionSettingsClient = dynamic(() => import("@/components/compression-settings-client"), {
  ssr: false,
  loading: () => <CompressionSettingsLoading />,
})

// Static loading component that doesn't use any data
function CompressionSettingsLoading() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Compression Settings</h1>
      <div className="w-full max-w-3xl mx-auto border rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function CompressionSettingsPage() {
  return <CompressionSettingsClient />
}
