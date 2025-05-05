"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

interface StripeConfig {
  hasSecretKey: boolean
  secretKeyLength: number
  secretKeyPrefix: string | null
  hasPremiumPriceId: boolean
  premiumPriceIdValue: string | null
  hasProPriceId: boolean
  proPriceIdValue: string | null
  hasWebhookSecret: boolean
  webhookSecretLength: number
  nodeEnv: string
  nextAuthUrl: string
}

export default function StripeConfigPage() {
  const [config, setConfig] = useState<StripeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/debug/check-stripe-config")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite")
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Vérification de la configuration Stripe</CardTitle>
              <CardDescription>Chargement des informations...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Vérification de la configuration Stripe</CardTitle>
            <CardDescription>Vérification des variables d'environnement nécessaires pour Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ConfigItem
                title="Clé secrète Stripe"
                isValid={config?.hasSecretKey}
                details={
                  config?.hasSecretKey
                    ? `Longueur: ${config.secretKeyLength}, Préfixe: ${config.secretKeyPrefix}`
                    : "Non configurée"
                }
              />

              <ConfigItem
                title="ID de prix Premium"
                isValid={config?.hasPremiumPriceId}
                details={config?.hasPremiumPriceId ? `Valeur: ${config.premiumPriceIdValue}` : "Non configuré"}
              />

              <ConfigItem
                title="ID de prix Pro"
                isValid={config?.hasProPriceId}
                details={config?.hasProPriceId ? `Valeur: ${config.proPriceIdValue}` : "Non configuré"}
              />

              <ConfigItem
                title="Secret Webhook"
                isValid={config?.hasWebhookSecret}
                details={config?.hasWebhookSecret ? `Longueur: ${config.webhookSecretLength}` : "Non configuré"}
              />

              <ConfigItem title="Environnement" isValid={true} details={`NODE_ENV: ${config?.nodeEnv}`} />

              <ConfigItem
                title="URL NextAuth"
                isValid={!!config?.nextAuthUrl}
                details={config?.nextAuthUrl || "Non configuré"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface ConfigItemProps {
  title: string
  isValid: boolean | undefined
  details: string
}

function ConfigItem({ title, isValid, details }: ConfigItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-md">
      <div className="mt-0.5">
        {isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{details}</p>
      </div>
    </div>
  )
}
