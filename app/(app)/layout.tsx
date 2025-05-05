"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import TopNav from "@/components/top-nav"
import { useRouter } from "next/navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for authentication using cookies
    const checkAuth = async () => {
      try {
        // Check if we have an app-session cookie or any other auth indicator
        const hasSession =
          document.cookie.includes("app-session=") ||
          document.cookie.includes("next-auth.session-token=") ||
          localStorage.getItem("isAuthenticated") === "true"

        setIsAuthenticated(hasSession)

        if (!hasSession) {
          console.log("No session found, redirecting to login")
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
