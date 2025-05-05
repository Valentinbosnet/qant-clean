"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function DebugAuthPage() {
  const { data: session, status, update } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")

  // Fonction pour réparer manuellement la session
  const fixSession = async () => {
    setIsUpdating(true)
    setMessage("Tentative de réparation de la session...")

    try {
      // Appel à l'API pour réparer la session
      const response = await fetch("/api/debug/fix-session", {
        method: "POST",
      })

      if (response.ok) {
        setMessage("Session réparée avec succès. Rafraîchissement...")
        // Rafraîchir la session
        await update()
        setMessage("Session mise à jour. Vous pouvez maintenant essayer d'accéder au dashboard.")
      } else {
        setMessage("Échec de la réparation de la session. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setMessage("Une erreur s'est produite. Veuillez réessayer.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Débogage de l'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="text-white font-medium mb-2">État de la session :</h3>
            <p className="text-gray-300">Status: {status}</p>
            {session ? (
              <>
                <p className="text-gray-300">Utilisateur: {session.user?.email}</p>
                <p className="text-gray-300">Email vérifié: {String(session.user?.emailVerified !== null)}</p>
                <p className="text-gray-300">Onboarding complété: {String(session.user?.onboardingCompleted)}</p>
                <pre className="mt-2 bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </>
            ) : (
              <p className="text-gray-300">Aucune session active</p>
            )}
          </div>

          {message && (
            <div className="bg-blue-900/30 border border-blue-700 rounded p-3">
              <p className="text-blue-300 text-sm">{message}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={fixSession}
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réparation en cours...
                </>
              ) : (
                "Réparer la session"
              )}
            </Button>

            <Button
              onClick={() => (window.location.href = "/api/auth/signout")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Déconnexion complète
            </Button>

            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Essayer d'accéder au dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
