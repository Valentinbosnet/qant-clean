"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, Key } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KeyStatus {
  available: boolean
  validFormat: boolean
  length: number
  message: string
}

export function OpenAIKeyStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null)

  useEffect(() => {
    const checkKeyStatus = async () => {
      try {
        const response = await fetch("/api/debug/openai-key-check")

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()
        setKeyStatus(data.keyStatus)
        setStatus(data.keyStatus.available ? "success" : "error")
      } catch (error) {
        console.error("Erreur lors de la vérification de la clé API:", error)
        setStatus("error")
      }
    }

    checkKeyStatus()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Statut de la clé API</CardTitle>
          {status !== "loading" && (
            <Badge variant={status === "success" ? "success" : "destructive"}>
              {status === "success" ? "Configurée" : "Non configurée"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {status === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : keyStatus ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`p-1.5 rounded-full mr-2 ${keyStatus.available ? "bg-green-100" : "bg-red-100"}`}>
                {keyStatus.available ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                )}
              </div>
              <div className="text-sm">
                <span className="font-medium">Disponibilité:</span>{" "}
                {keyStatus.available ? "Clé trouvée" : "Clé manquante"}
              </div>
            </div>

            {keyStatus.available && (
              <>
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-full mr-2 ${keyStatus.validFormat ? "bg-green-100" : "bg-amber-100"}`}>
                    {keyStatus.validFormat ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Format:</span>{" "}
                    {keyStatus.validFormat ? "Valide (sk-...)" : "Potentiellement invalide"}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-1.5 rounded-full mr-2 bg-blue-100">
                    <Key className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Longueur:</span> {keyStatus.length} caractères
                    {keyStatus.length < 30 && <span className="text-amber-600 ml-1">(trop court)</span>}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Impossible de vérifier le statut de la clé API</div>
        )}
      </CardContent>
    </Card>
  )
}
