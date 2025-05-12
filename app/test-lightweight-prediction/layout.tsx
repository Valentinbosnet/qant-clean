import type React from "react"
export default function TestLightweightPredictionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
