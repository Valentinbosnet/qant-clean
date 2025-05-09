"use client"

import { useState } from "react"
import { OpenAITest } from "@/components/api/openai-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function ApiTestPage() {
  const [openaiStatus, setOpenaiStatus] = useState<"success" | "error" | "loading" | "idle">("idle")
  const [alphaVantageStatus, setAlphaVantageStatus] = useState<"success" | "error" | "loading" | "idle">("idle")

  const handleRefreshAll = () => {
    // Rafraîchir la page pour relancer tous les tests
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test des API</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/settings/api")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux paramètres
          </Button>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tout rafraîchir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="openai">
        <TabsList className="mb-4">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="alphavantage">Alpha Vantage</TabsTrigger>
          <TabsTrigger value="all">Tous les services</TabsTrigger>
        </TabsList>

        <TabsContent value="openai">
          <OpenAITest onStatusChange={setOpenaiStatus} />
        </TabsContent>

        <TabsContent value="alphavantage">
          <Card>
            <CardHeader>
              <CardTitle>Test de l'API Alpha Vantage</CardTitle>
              <CardDescription>
                Vérifiez la connectivité avec l'API Alpha Vantage pour les données boursières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Le test de l'API Alpha Vantage sera implémenté prochainement.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OpenAITest onStatusChange={setOpenaiStatus} />

            <Card>
              <CardHeader>
                <CardTitle>Test de l'API Alpha Vantage</CardTitle>
                <CardDescription>
                  Vérifiez la connectivité avec l'API Alpha Vantage pour les données boursières
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Le test de l'API Alpha Vantage sera implémenté prochainement.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Résumé des tests</CardTitle>
          <CardDescription>État actuel de la connectivité avec les différentes API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">OpenAI API</div>
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${
                    openaiStatus === "success"
                      ? "bg-green-500"
                      : openaiStatus === "error"
                        ? "bg-red-500"
                        : openaiStatus === "loading"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-sm">
                  {openaiStatus === "success"
                    ? "Connecté"
                    : openaiStatus === "error"
                      ? "Erreur"
                      : openaiStatus === "loading"
                        ? "Test en cours..."
                        : "Non testé"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">Alpha Vantage API</div>
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${
                    alphaVantageStatus === "success"
                      ? "bg-green-500"
                      : alphaVantageStatus === "error"
                        ? "bg-red-500"
                        : alphaVantageStatus === "loading"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-sm">
                  {alphaVantageStatus === "success"
                    ? "Connecté"
                    : alphaVantageStatus === "error"
                      ? "Erreur"
                      : alphaVantageStatus === "loading"
                        ? "Test en cours..."
                        : "Non testé"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Dernière mise à jour: {new Date().toLocaleString()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
