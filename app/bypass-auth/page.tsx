"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function BypassAuthPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(true)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const bypass = async () => {
      try {
        addLog("Démarrage du bypass d'authentification...")

        // Vérifier le statut de l'utilisateur
        addLog("Vérification du statut de l'utilisateur...")
        const statusResponse = await fetch("/api/user/check-status")
        const statusData = await statusResponse.json()
        addLog(`Statut de l'utilisateur: ${JSON.stringify(statusData)}`)

        // Si l'email n'est pas vérifié, le forcer
        if (!statusData.emailVerified) {
          addLog("Email non vérifié, forçage de la vérification...")
          const verifyResponse = await fetch("/api/auth/force-verify-email", {
            method: "POST",
          })

          if (verifyResponse.ok) {
            addLog("Email vérifié avec succès")
          } else {
            addLog("Échec de la vérification de l'email")
          }
        } else {
          addLog("Email déjà vérifié")
        }

        // Attendre un moment avant de rediriger
        addLog("Préparation de la redirection...")
        setTimeout(() => {
          addLog("Redirection vers le dashboard...")
          window.location.href = "/dashboard"
        }, 2000)
      } catch (error) {
        addLog(`Erreur: ${error}`)
        setIsProcessing(false)
      }
    }

    bypass()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Contournement d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <h2 className="text-xl font-semibold text-white text-center">Préparation de l'accès...</h2>
            <p className="text-gray-300 text-center">
              Veuillez patienter pendant que nous préparons votre accès au dashboard.
            </p>

            {/* Boutons de navigation manuelle */}
            <div className="mt-6 w-full space-y-2">
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Accéder directement au dashboard
              </Button>
              <Button
                onClick={() => (window.location.href = "/emergency-fix")}
                variant="outline"
                className="w-full border-amber-500 text-amber-400 hover:bg-amber-950"
              >
                Correction d'urgence
              </Button>
            </div>

            {/* Logs */}
            <div className="w-full mt-6">
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
