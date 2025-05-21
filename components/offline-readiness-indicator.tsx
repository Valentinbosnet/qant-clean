"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { WifiIcon, WifiOffIcon } from "lucide-react"

export function OfflineReadinessIndicator() {
  const [readinessScore, setReadinessScore] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [status, setStatus] = useState<"ready" | "partial" | "limited">("limited")

  useEffect(() => {
    // Vérifier l'état de la connexion
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Calculer le score de préparation hors ligne
    const calculateReadinessScore = () => {
      // Simuler un calcul de score basé sur les données préchargées, etc.
      // Dans une implémentation réelle, ce score serait basé sur:
      // - Quantité de données préchargées
      // - Fraîcheur des données
      // - Couverture des fonctionnalités principales
      const mockScore = Math.floor(Math.random() * 40) + 60 // Score entre 60 et 100 pour la démo
      setReadinessScore(mockScore)

      if (mockScore >= 80) {
        setStatus("ready")
      } else if (mockScore >= 50) {
        setStatus("partial")
      } else {
        setStatus("limited")
      }
    }

    checkOnlineStatus()
    calculateReadinessScore()

    // Écouter les changements de connectivité
    window.addEventListener("online", checkOnlineStatus)
    window.addEventListener("offline", checkOnlineStatus)

    return () => {
      window.removeEventListener("online", checkOnlineStatus)
      window.removeEventListener("offline", checkOnlineStatus)
    }
  }, [])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Préparation hors ligne</h3>
              <Badge variant={status === "ready" ? "default" : status === "partial" ? "warning" : "destructive"}>
                {status === "ready" ? "Prêt" : status === "partial" ? "Partiellement prêt" : "Préparation limitée"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={readinessScore} className="h-2 w-[200px]" />
              <span className="text-sm font-medium">{readinessScore}/100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <WifiIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">En ligne</span>
              </>
            ) : (
              <>
                <WifiOffIcon className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-500">Hors ligne</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
