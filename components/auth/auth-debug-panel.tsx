"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { getBrowserClient } from "@/lib/client-supabase"

export function AuthDebugPanel() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const checkSession = async () => {
    try {
      const supabase = getBrowserClient()
      const { data, error } = await supabase.auth.getSession()
      setSessionDetails({ data, error })
    } catch (error) {
      setSessionDetails({ error })
    }
    setShowDetails(true)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || "Not logged in"}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || "N/A"}
          </div>
          <div className="mt-4">
            <Button onClick={checkSession} variant="outline" size="sm">
              Check Session
            </Button>
          </div>

          {showDetails && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Session Details:</h4>
              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(sessionDetails, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
