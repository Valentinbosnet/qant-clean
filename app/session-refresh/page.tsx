"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SessionRefreshPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  // Automatiquement rafraîchir la session au chargement de la page
  useEffect(() => {
    const refreshSession = async () => {
      try {
        addLog("Démarrage du rafraîchissement de session...")

        // Vérifier l'état de l'utilisateur dans la base de données
        const statusResponse = await fetch("/api/user/check-status")
        const statusData = await statusResponse.json()
        addLog(`État de l'utilisateur dans la base de données: ${JSON.stringify(statusData)}`)

        // Mettre à jour la session
        addLog("Mise à jour de la session...")
        await update()
        addLog("Session mise à jour")

        // Déterminer où rediriger en fonction de l'état de l'utilisateur
        if (!statusData.emailVerified) {
          addLog("Redirection vers verify-email...")
          window.location.href = "/verify-email"
          return
        } else {
          // Si l'email est vérifié, rediriger vers le dashboard
          addLog("Redirection vers dashboard...")
          window.location.href = "/dashboard"
          return
        }
      } catch (error) {
        addLog(`Erreur: ${error}`)
        setIsRefreshing(false)

        // En cas d'erreur, rediriger vers le dashboard après un court délai
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      }
    }

    // Exécuter immédiatement la fonction de rafraîchissement
    if (status === "authenticated") {
      refreshSession()
    } else if (status === "unauthenticated") {
      router.push("/login")
    } else {
      // Si le statut est "loading", attendre un court délai puis vérifier à nouveau
      const timer = setTimeout(() => {
        if (status === "authenticated") {
          refreshSession()
        } else if (status === "unauthenticated") {
          router.push("/login")
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [status, update, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <h2 className="text-xl font-semibold text-white text-center">Rafraîchissement de la session...</h2>
            <p className="text-gray-300 text-center">
              Veuillez patienter pendant que nous rafraîchissons votre session.
            </p>

            {/* Logs cachés par défaut */}
            <div className="w-full mt-6 hidden">
              <details>
                <summary className="text-gray-400 cursor-pointer text-sm">Logs de débogage</summary>
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
