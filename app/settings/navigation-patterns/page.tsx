"use client"

import dynamic from "next/dynamic"

// Create a simple loading component with no data dependencies
function NavigationPatternsLoading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Navigation Patterns</h1>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
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
