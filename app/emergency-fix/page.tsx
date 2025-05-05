"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, LogOut, AlertTriangle } from "lucide-react"

export default function EmergencyFixPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [autoFixAttempted, setAutoFixAttempted] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  // Fonction de correction d'urgence
  const fixUser = async () => {
    setLoading(true)
    try {
      addLog("Démarrage de la correction d'urgence...")

      // 1. Mise à jour directe de la base de données
      addLog("Appel de l'API de mise à jour directe...")
      const response = await fetch("/api/emergency-fix", {
        method: "POST",
      })

      const data = await response.json()
      addLog(`Réponse de l'API: ${JSON.stringify(data)}`)

      if (!response.ok) {
        throw new Error(data.error || "Échec de la mise à jour de l'utilisateur")
      }

      setSuccess(true)
      addLog("Utilisateur mis à jour avec succès")

      // 2. Rafraîchir la session
      addLog("Rafraîchissement de la session...")
      try {
        // Utiliser fetch directement pour éviter les problèmes avec useSession
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ csrfToken: await getCsrfToken() }),
        })
        addLog("Session rafraîchie")
      } catch (sessionError) {
        addLog(`Erreur lors du rafraîchissement de la session: ${sessionError}`)
        // Continuer même si le rafraîchissement échoue
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
      addLog(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour obtenir le CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await fetch("/api/auth/csrf")
      const data = await response.json()
      return data.csrfToken
    } catch (error) {
      console.error("Erreur lors de la récupération du CSRF token:", error)
      return ""
    }
  }

  // Tentative automatique de correction, mais une seule fois
  useEffect(() => {
    if (status === "authenticated" && !autoFixAttempted) {
      setAutoFixAttempted(true)
      fixUser()
    }
  }, [status, autoFixAttempted])

  const handleLogout = () => {
    addLog("Déconnexion...")
    window.location.href = "/api/auth/signout"
  }

  const handleManualNavigation = (path: string) => {
    addLog(`Navigation manuelle vers ${path}...`)
    window.location.href = path
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Correction d'urgence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-900/30 border border-amber-700 rounded p-4 text-amber-300 text-sm">
            <p className="font-medium mb-2">Problème détecté</p>
            <p>Une boucle de redirection a été détectée. Cette page vous permet de résoudre le problème.</p>
          </div>

          {status === "unauthenticated" ? (
            <div className="bg-red-900/30 border border-red-700 rounded p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Vous n'êtes pas connecté</p>
                <p className="text-red-300 text-sm mt-1">
                  Veuillez vous connecter pour accéder à cette fonctionnalité.
                </p>
                <Button onClick={() => handleManualNavigation("/login")} className="mt-3 bg-red-600 hover:bg-red-700">
                  Se connecter
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
              <p className="text-emerald-500">Correction de votre compte en cours...</p>
            </div>
          ) : success ? (
            <div className="bg-green-900/30 border border-green-700 rounded p-6 flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Compte corrigé avec succès !</h3>
              <p className="text-green-300 text-center mb-4">
                Votre compte a été corrigé. Vous pouvez maintenant naviguer manuellement.
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 rounded p-6 flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Erreur lors de la correction du compte</h3>
              <p className="text-red-300 text-center mb-4">
                {error || "Une erreur inconnue s'est produite lors de la tentative de correction de votre compte."}
              </p>
              <Button onClick={fixUser} className="bg-emerald-600 hover:bg-emerald-700">
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="bg-gray-700 rounded p-4 text-gray-300">
              <p>Cliquez sur le bouton ci-dessous pour tenter de corriger votre compte.</p>
              <Button onClick={fixUser} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
                Corriger mon compte
              </Button>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">Navigation manuelle:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleManualNavigation("/dashboard")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => handleManualNavigation("/login")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Page de connexion
              </Button>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion complète
            </Button>
          </div>

          {/* Logs de débogage */}
          <div className="mt-6">
            <details>
              <summary className="text-gray-400 cursor-pointer text-sm">Logs de débogage</summary>
              <div className="mt-2 bg-gray-900 p-2 rounded text-xs text-gray-400 max-h-40 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
