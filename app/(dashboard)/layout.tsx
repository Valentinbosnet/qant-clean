export const dynamic = "force-dynamic"

import type React from "react"
import Sidebar from "@/components/sidebar"
import TopNav from "@/components/top-nav"
import AuthGuard from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireVerified={true}>
      <div className="flex flex-col h-screen bg-gray-900">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </div>
      </div>
    </AuthGuard>
  )
}
