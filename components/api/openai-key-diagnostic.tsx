"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Key, Settings } from "lucide-react"

export function OpenAIKeyDiagnostic() {
  const [keyStatus, setKeyStatus] = useState<{
    available: boolean
    length: number
    validFormat: boolean
    message: string
    loading: boolean
    error: string | null
  }>({
    available: false,
    length: 0,
    validFormat: false,
    message: "Vérification de la clé API...",
    loading: true,
    error: null,
  })

  const checkApiKey = async () => {
    setKeyStatus((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch("/api/debug/openai-key-check")

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification de la clé API: ${response.status}`)
      }

      const data = await response.json()

      setKeyStatus({
        available: data.keyStatus.available,
        length: data.keyStatus.length,
        validFormat: data.keyStatus.validFormat,
        message: data.message,
        loading: false,
        error: null,
      })
    } catch (error) {
      setKeyStatus({
        available: false,
        length: 0,
        validFormat: false,
        message: "Erreur lors de la vérification de la clé API",
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  useEffect(() => {
    checkApiKey()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnostic de la clé API OpenAI</span>
          <Badge variant={keyStatus.available && keyStatus.validFormat ? "success" : "destructive"}>
            {keyStatus.available && keyStatus.validFormat ? "Configurée" : "Non configurée"}
          </Badge>
        </CardTitle>
        <CardDescription>Vérification de la configuration de la clé API OpenAI</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${keyStatus.available ? "bg-green-100" : "bg-red-100"}`}>
              {keyStatus.available ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">Disponibilité</p>
              <p className="text-sm text-muted-foreground">
                {keyStatus.available ? "Clé API trouvée" : "Clé API non trouvée"}
              </p>
            </div>
          </div>

          {keyStatus.available && (
            <>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${keyStatus.validFormat ? "bg-green-100" : "bg-yellow-100"}`}>
                  {keyStatus.validFormat ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Format</p>
                  <p className="text-sm text-muted-foreground">
                    {keyStatus.validFormat
                      ? "Format valide (commence par 'sk-')"
                      : "Format potentiellement invalide (ne commence pas par 'sk-')"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Longueur</p>
                  <p className="text-sm text-muted-foreground">
                    {keyStatus.length} caractères {keyStatus.length < 30 ? "(potentiellement trop court)" : ""}
                  </p>
                </div>
              </div>
            </>
          )}

          {keyStatus.error && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">
              <p className="font-medium">Erreur lors de la vérification</p>
              <p>{keyStatus.error}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkApiKey} disabled={keyStatus.loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${keyStatus.loading ? "animate-spin" : ""}`} />
          Vérifier à nouveau
        </Button>

        <Button variant="default" onClick={() => (window.location.href = "/settings/api")}>
          <Settings className="h-4 w-4 mr-2" />
          Configurer la clé API
        </Button>
      </CardFooter>
    </Card>
  )
}
