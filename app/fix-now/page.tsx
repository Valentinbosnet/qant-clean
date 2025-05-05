"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"

export default function FixNowPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fixUser = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/fix-user-now")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec de la mise à jour de l'utilisateur")
      }

      setSuccess(true)

      // Rafraîchir la session
      await update()

      // Attendre 2 secondes avant de rediriger
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  // Exécuter automatiquement la correction au chargement de la page
  useEffect(() => {
    fixUser()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Correction automatique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-700 p-3 rounded text-sm mb-4">
            <p className="font-medium text-white mb-1">Correction de boucle de redirection :</p>
            <p className="text-gray-300">
              Nous avons détecté une boucle de redirection entre le tableau de bord et la page de configuration. Nous
              corrigeons automatiquement votre compte pour résoudre ce problème.
            </p>
          </div>
          <p className="text-gray-300">
            Nous corrigeons automatiquement votre compte pour vous permettre d'accéder au tableau de bord.
          </p>

          {session && (
            <div className="bg-gray-700 p-3 rounded text-sm">
              <p className="font-medium text-white mb-1">Session actuelle :</p>
              <p className="text-gray-300">Utilisateur : {session.user.email}</p>
              <p className="text-gray-300">Email vérifié : {String(session.user.emailVerified)}</p>
              <p className="text-gray-300">Onboarding terminé : {String(session.user.onboardingCompleted)}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 flex items-start">
              <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-700 rounded p-3 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-300 text-sm">Votre compte a été mis à jour avec succès !</p>
                <p className="text-green-300 text-sm mt-1">Redirection vers le tableau de bord...</p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
                <span className="text-emerald-500">Correction en cours...</span>
              </div>
            ) : (
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Aller au tableau de bord
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
