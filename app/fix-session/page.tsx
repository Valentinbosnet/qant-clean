"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function FixSessionPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [isFixing, setIsFixing] = useState(true)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  // Automatically fix the session when the page loads
  useEffect(() => {
    const fixSession = async () => {
      try {
        addLog("Starting session fix...")

        // First, check user status
        const statusResponse = await fetch("/api/user/check-status")
        const statusData = await statusResponse.json()
        addLog(`User status: ${JSON.stringify(statusData)}`)

        // If email is verified in the database, force update the session
        if (statusData.emailVerified) {
          addLog("Email is verified in database, updating session...")

          // Force verify email if needed
          const verifyResponse = await fetch("/api/auth/force-verify-email", {
            method: "POST",
          })

          if (verifyResponse.ok) {
            addLog("Email verification forced successfully")
          } else {
            addLog("Failed to force email verification")
          }

          // Update the session
          addLog("Updating session...")
          await update()
          addLog("Session updated")

          // Wait a moment before redirecting
          setTimeout(() => {
            if (statusData.onboardingCompleted) {
              addLog("Redirecting to dashboard...")
              router.push("/dashboard")
            } else {
              addLog("Redirecting to get-started...")
              router.push("/get-started")
            }
          }, 2000)
        } else {
          addLog("Email is not verified, redirecting to verification page...")
          router.push("/verify-email")
        }
      } catch (error) {
        addLog(`Error: ${error}`)
        setIsFixing(false)
      }
    }

    if (status === "authenticated") {
      fixSession()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, update, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <h2 className="text-xl font-semibold text-white text-center">Fixing Session...</h2>
            <p className="text-gray-300 text-center">
              Please wait while we fix your session and redirect you to the appropriate page.
            </p>

            {/* Manual redirect button */}
            <div className="mt-6 w-full">
              <Button
                onClick={() => router.push("/get-started")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Continue to Get Started
              </Button>
            </div>

            {/* Logs */}
            <div className="w-full mt-6">
              <details>
                <summary className="text-gray-400 cursor-pointer text-sm">Debug logs</summary>
                <div className="mt-2 bg-gray-900 p-2 rounded text-xs text-gray-400 max-h-40 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
