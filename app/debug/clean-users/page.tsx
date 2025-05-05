"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function CleanUsersPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const cleanSpecificUser = async () => {
    if (!email) {
      setError("Veuillez entrer une adresse email")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/debug/clean-orphan-users?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  const cleanAllOrphanUsers = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/debug/clean-orphan-users")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Nettoyage des utilisateurs</CardTitle>
          <CardDescription className="text-gray-400">
            Supprimez les utilisateurs qui existent dans auth.users mais pas dans app_users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Adresse email spécifique (optionnel)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={cleanSpecificUser}
              disabled={loading || !email}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Nettoyage en cours...
                </>
              ) : (
                "Nettoyer cet utilisateur"
              )}
            </Button>

            <Button
              onClick={cleanAllOrphanUsers}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Nettoyage en cours...
                </>
              ) : (
                "Nettoyer tous les utilisateurs orphelins"
              )}
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
                <p className="text-emerald-300 text-sm">{result.message}</p>
              </div>
              {result.details && (
                <pre className="text-xs text-gray-300 mt-2 bg-gray-700/50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-xs">
            Cette page est destinée au débogage uniquement. Utilisez-la avec précaution.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
