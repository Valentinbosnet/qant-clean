import type React from "react"
export default function SectorPredictionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
