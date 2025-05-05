"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ForceVerifyPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    if (!email) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/debug/sync-email-verification?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Une erreur s'est produite")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForceVerify = async () => {
    if (!email) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/auth/force-verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Une erreur s'est produite")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Force Email Verification</CardTitle>
          <CardDescription className="text-gray-400">
            Synchroniser ou forcer la vérification d'email entre auth.users et app_users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSync}
              disabled={loading || !email}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Synchroniser
            </Button>
            <Button
              onClick={handleForceVerify}
              disabled={loading || !email}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Forcer la vérification
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded p-3">
              <div className="flex items-start mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-emerald-300 text-sm font-medium">{result.message}</p>
              </div>
              <pre className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/login")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Retour à la connexion
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/debug-auth")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Debug Auth
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
