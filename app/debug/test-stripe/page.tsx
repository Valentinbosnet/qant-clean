"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StripeTestResult {
  connectionStatus: string
  balance?: {
    available: any[]
    pending: any[]
  }
  prices?: {
    premium: any
    pro: any
  }
  error?: string
  details?: string
}

export default function TestStripePage() {
  const [result, setResult] = useState<StripeTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testStripeConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/test-stripe")
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test de connexion Stripe</CardTitle>
            <CardDescription>Vérifiez la connexion à l'API Stripe et la validité des IDs de prix</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testStripeConnection} disabled={loading} className="w-full">
                {loading ? "Test en cours..." : "Tester la connexion Stripe"}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3 p-3 border rounded-md">
                    <div className="mt-0.5">
                      {result.connectionStatus === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Connexion à l'API Stripe</h3>
                      <p className="text-sm text-gray-500">
                        {result.connectionStatus === "success"
                          ? "Connexion réussie"
                          : `Échec de la connexion: ${result.error}`}
                      </p>
                    </div>
                  </div>

                  {result.balance && (
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium mb-2">Solde du compte</h3>
                      <div className="text-sm">
                        <p>
                          Disponible:{" "}
                          {result.balance.available.length > 0
                            ? result.balance.available
                                .map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`)
                                .join(", ")
                            : "0"}
                        </p>
                        <p>
                          En attente:{" "}
                          {result.balance.pending.length > 0
                            ? result.balance.pending
                                .map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`)
                                .join(", ")
                            : "0"}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.prices && (
                    <>
                      <PriceInfo title="Prix Premium" priceData={result.prices.premium} />

                      <PriceInfo title="Prix Pro" priceData={result.prices.pro} />
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface PriceInfoProps {
  title: string
  priceData: any
}

function PriceInfo({ title, priceData }: PriceInfoProps) {
  const hasError = priceData.error !== undefined

  return (
    <div className="flex items-start gap-3 p-3 border rounded-md">
      <div className="mt-0.5">
        {hasError ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : priceData.active ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        )}
      </div>
      <div className="w-full">
        <h3 className="font-medium">{title}</h3>
        {hasError ? (
          <div className="text-sm text-red-500">
            <p>{priceData.error}</p>
            {priceData.details && <p className="text-xs mt-1">{priceData.details}</p>}
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p>
              ID: <span className="font-mono text-xs">{priceData.id}</span>
            </p>
            <p>Statut: {priceData.active ? "Actif" : "Inactif"}</p>
            <p>
              Montant:{" "}
              {priceData.unit_amount ? `${priceData.unit_amount / 100} ${priceData.currency.toUpperCase()}` : "N/A"}
            </p>
            <p>
              Produit: <span className="font-mono text-xs">{priceData.product}</span>
            </p>
            <p>Type: {priceData.type}</p>
          </div>
        )}
      </div>
    </div>
  )
}
