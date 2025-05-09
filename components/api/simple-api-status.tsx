"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export function SimpleApiStatus() {
  const [status, setStatus] = useState<"checking" | "success" | "error" | "idle">("idle")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<string>("")

  const checkApiStatus = async () => {
    setStatus("checking")
    setMessage("")
    setDetails("")

    try {
      // Utiliser un chemin relatif au lieu d'une URL complète
      const response = await fetch("/api/test/openai-simple")

      if (response.ok) {
        const data = await response.json()
        setStatus("success")
        setMessage(data.message || "L'API OpenAI est correctement configurée et fonctionnelle.")
        setDetails(JSON.stringify(data, null, 2))
      } else {
        let errorMessage = "L'API OpenAI n'est pas correctement configurée."
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          setDetails(JSON.stringify(data, null, 2))
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          setDetails(`Réponse non-JSON: ${await response.text()}`)
        }
        setStatus("error")
        setMessage(errorMessage)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'API:", error)
      setStatus("error")
      setMessage("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
      setDetails(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Statut de l'API OpenAI</h3>
        {status !== "checking" && (
          <Badge
            variant={status === "success" ? "success" : status === "error" ? "destructive" : "outline"}
            className="ml-2"
          >
            {status === "success" ? "Fonctionnelle" : status === "error" ? "Erreur" : "Vérification..."}
          </Badge>
        )}
      </div>

      {status === "checking" ? (
        <div className="flex items-center text-sm text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
          Vérification de l'API OpenAI...
        </div>
      ) : status === "success" ? (
        <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>API OpenAI fonctionnelle</AlertTitle>
          <AlertDescription>
            {message}
            {details && <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">{details}</pre>}
          </AlertDescription>
        </Alert>
      ) : status === "error" ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Problème avec l'API OpenAI</AlertTitle>
          <AlertDescription>
            {message}
            {details && <pre className="mt-2 p-2 bg-red-100 text-red-900 rounded text-xs overflow-auto">{details}</pre>}
            <div className="mt-2 flex space-x-2">
              <Button size="sm" variant="outline" onClick={checkApiStatus}>
                Réessayer
              </Button>
              <Button size="sm" variant="outline" onClick={() => (window.location.href = "/test-openai")}>
                Diagnostic détaillé
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Statut inconnu</AlertTitle>
          <AlertDescription>
            Cliquez sur le bouton ci-dessous pour vérifier le statut de l'API OpenAI.
            <div className="mt-2">
              <Button size="sm" onClick={checkApiStatus}>
                Vérifier l'API
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
