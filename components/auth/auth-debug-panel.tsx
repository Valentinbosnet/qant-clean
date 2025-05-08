"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getBrowserClient } from "@/lib/client-supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthDebugPanel() {
  const { user, session, isAuthenticated, isLoading } = useAuth()
  const [clientUser, setClientUser] = useState<any>(null)
  const [clientSession, setClientSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkClientAuth() {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        setError("Supabase client not available")
        return
      }

      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        setError(`User error: ${userError.message}`)
        return
      }

      setClientUser(userData.user)

      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`)
        return
      }

      setClientSession(sessionData.session)
      setError(null)
    } catch (e: any) {
      setError(`Exception: ${e.message}`)
    }
  }

  useEffect(() => {
    checkClientAuth()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold">Auth Context</h3>
            <div className="text-sm">
              <p>Loading: {isLoading ? "Yes" : "No"}</p>
              <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
              <p>User ID: {user?.id || "None"}</p>
              <p>Email: {user?.email || "None"}</p>
              <p>Session: {session ? "Valid" : "None"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Direct Client Check</h3>
            <div className="text-sm">
              <p>User ID: {clientUser?.id || "None"}</p>
              <p>Email: {clientUser?.email || "None"}</p>
              <p>Session: {clientSession ? "Valid" : "None"}</p>
              {error && <p className="text-red-500">Error: {error}</p>}
            </div>
          </div>
        </div>

        <Button onClick={checkClientAuth} variant="outline" size="sm">
          Refresh Auth Status
        </Button>
      </CardContent>
    </Card>
  )
}
