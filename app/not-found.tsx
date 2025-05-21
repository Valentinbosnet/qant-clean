"use client"

import dynamic from "next/dynamic"

// Create a simple loading component with no data dependencies
function NotFoundLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
}

// Dynamically import the client component with SSR disabled
const NotFoundClient = dynamic(() => import("@/components/not-found-client"), {
  ssr: false,
  loading: () => <NotFoundLoading />,
})

export default function NotFound() {
  return <NotFoundClient />
}
