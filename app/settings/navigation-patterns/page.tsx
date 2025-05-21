"use client"

import dynamic from "next/dynamic"

// Create a simple loading component with no data dependencies
function NavigationPatternsLoading() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Patterns</h1>
      <div className="w-full bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dynamically import the client component with SSR disabled
const NavigationPatternsClient = dynamic(() => import("@/components/navigation-patterns-client"), {
  ssr: false,
  loading: () => <NavigationPatternsLoading />,
})

export default function NavigationPatternsPage() {
  return <NavigationPatternsClient />
}
