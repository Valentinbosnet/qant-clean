"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Copy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Price {
  id: string
  currency: string
  unit_amount: number | null
  recurring: {
    interval: string
    interval_count: number
  } | null
  type: string
}

interface Product {
  product: {
    id: string
    name: string
    description: string | null
    active: boolean
  }
  prices: Price[]
}

export default function StripePricesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/debug/get-prices")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data.products)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur s'est produite")
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2">Chargement des prix Stripe...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Produits et Prix Stripe</h1>
        <p className="mb-8 text-gray-600">
          Cette page affiche tous vos produits et prix actifs dans Stripe. Utilisez ces IDs pour configurer vos
          variables d'environnement.
        </p>

        {products.length === 0 ? (
          <Alert>
            <AlertTitle>Aucun produit trouvé</AlertTitle>
            <AlertDescription>
              Aucun produit actif n'a été trouvé dans votre compte Stripe. Veuillez créer des produits et des prix dans
              votre dashboard Stripe.
            </AlertDescription>
          </Alert>
        ) : (
          products.map((item) => (
            <Card key={item.product.id} className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.product.name}</CardTitle>
                    <CardDescription>{item.product.description || "Aucune description"}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => copyToClipboard(item.product.id, `product-${item.product.id}`)}
                  >
                    {copied === `product-${item.product.id}` ? (
                      <>
                        <CheckCircle className="h-4 w-4" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> ID Produit
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">ID: {item.product.id}</div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-3">Prix disponibles:</h3>
                {item.prices.length === 0 ? (
                  <p className="text-amber-600">Aucun prix actif pour ce produit</p>
                ) : (
                  <div className="space-y-3">
                    {item.prices.map((price) => (
                      <div key={price.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {price.unit_amount ? (price.unit_amount / 100).toFixed(2) : "Variable"}{" "}
                              {price.currency.toUpperCase()}
                              {price.recurring
                                ? ` / ${price.recurring.interval_count > 1 ? price.recurring.interval_count : ""}${
                                    price.recurring.interval
                                  }`
                                : " (paiement unique)"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">ID: {price.id}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => copyToClipboard(price.id, `price-${price.id}`)}
                          >
                            {copied === `price-${price.id}` ? (
                              <>
                                <CheckCircle className="h-4 w-4" /> Copié
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" /> ID Prix
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-md border">
          <h2 className="text-lg font-medium mb-2">Comment configurer vos variables d'environnement</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Copiez l'ID du prix (pas l'ID du produit) que vous souhaitez utiliser</li>
            <li>
              Mettez à jour vos variables d'environnement:
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                STRIPE_PREMIUM_PRICE_ID=price_xxx...
                <br />
                STRIPE_PRO_PRICE_ID=price_yyy...
              </pre>
            </li>
            <li>Redémarrez votre serveur pour appliquer les changements</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
