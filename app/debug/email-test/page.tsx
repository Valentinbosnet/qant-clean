"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const testEmailConfig = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/test-email")
      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.message || "Échec du test de configuration email")
      }
    } catch (err) {
      console.error("Erreur lors du test:", err)
      setError("Erreur lors de la communication avec le serveur")
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!email) {
      setError("Veuillez entrer une adresse email")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.message || "Échec de l'envoi de l'email de test")
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err)
      setError("Erreur lors de la communication avec le serveur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test de configuration email</CardTitle>
          <CardDescription>Vérifiez si votre configuration SMTP fonctionne correctement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={testEmailConfig} disabled={loading} className="w-full">
              {loading ? "Test en cours..." : "Tester la configuration SMTP"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Envoyer un email de test à:</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button onClick={sendTestEmail} disabled={loading || !email} variant="outline" className="w-full">
            {loading ? "Envoi en cours..." : "Envoyer un email de test"}
          </Button>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm overflow-auto max-h-60">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          Les résultats détaillés apparaîtront également dans la console du serveur.
        </CardFooter>
      </Card>
    </div>
  )
}
