"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailTestPanel() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  const handleSendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/alerts/sectors/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setTestResult({
          success: true,
          message: "Email de test envoyé avec succès. Vérifiez votre boîte de réception.",
        })
        toast({
          title: "Email envoyé",
          description: "L'email de test a été envoyé avec succès",
          variant: "success",
        })
      } else {
        setTestResult({
          success: false,
          message: `Erreur lors de l'envoi de l'email: ${data.error || "Erreur inconnue"}`,
        })
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de l'envoi de l'email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      setTestResult({
        success: false,
        message: `Erreur lors de l'envoi de l'email: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      })
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de l'email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Test d'envoi d'email
        </CardTitle>
        <CardDescription>
          Envoyez un email de test pour vérifier la configuration des alertes sectorielles par email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-md ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            <div className="flex items-start">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <p>{testResult.message}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendTestEmail} disabled={loading} className="w-full">
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Envoyer un email de test
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
