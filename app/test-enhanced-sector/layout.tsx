import type React from "react"
export default function TestEnhancedSectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
