"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function ApiQuotaDebugPage() {
  const [quotaInfo, setQuotaInfo] = useState<any>(null)
  const [testResponse, setTestResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  const fetchQuotaInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/quota-info")
      const data = await response.json()
      setQuotaInfo(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de quota:", error)
    } finally {
      setLoading(false)
    }
  }

  const testApiCall = async () => {
    setTestLoading(true)
    setTestResponse(null)
    try {
      const response = await fetch("/api/technical-analysis?symbol=AAPL&allowSimulated=false")
      const data = await response.json()
      setTestResponse({
        status: response.status,
        data: data,
      })
      // Rafraîchir les informations de quota après le test
      fetchQuotaInfo()
    } catch (error) {
      console.error("Erreur lors du test de l'API:", error)
      setTestResponse({
        status: 500,
        error: "Erreur lors de l'exécution du test",
      })
    } finally {
      setTestLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotaInfo()

    // Rafraîchir automatiquement toutes les 15 secondes
    const interval = setInterval(() => {
      fetchQuotaInfo()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // Formater le temps
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString()
  }

  // Calculer le temps restant
  const getTimeRemaining = (date: string) => {
    const remainingMs = new Date(date).getTime() - Date.now()
    if (remainingMs <= 0) return "0s"

    const seconds = Math.floor((remainingMs / 1000) % 60)
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60)

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Débogage du Quota d'API</h1>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informations de Quota</TabsTrigger>
          <TabsTrigger value="test">Test d'API</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>État Actuel du Quota</span>
                  <Button variant="outline" size="icon" onClick={fetchQuotaInfo} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </CardTitle>
                <CardDescription>Informations sur le quota d'API Alpha Vantage</CardDescription>
              </CardHeader>
              <CardContent>
                {!quotaInfo ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Statut global</span>
                        {quotaInfo.canMakeRequest ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" /> Disponible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" /> Limité
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Requêtes par minute</span>
                            <span className="text-sm font-medium">
                              {quotaInfo.requestsThisMinute}/{quotaInfo.minuteLimit}
                            </span>
                          </div>
                          <Progress
                            value={(quotaInfo.requestsThisMinute / quotaInfo.minuteLimit) * 100}
                            className="h-2"
                            indicatorClassName={
                              quotaInfo.requestsThisMinute >= quotaInfo.minuteLimit ? "bg-red-500" : ""
                            }
                          />
                          {quotaInfo.requestsThisMinute > 0 && (
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Réinitialisation dans {getTimeRemaining(quotaInfo.minuteResetTime)}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Requêtes quotidiennes</span>
                            <span className="text-sm font-medium">
                              {quotaInfo.requestsToday}/{quotaInfo.dailyLimit}
                            </span>
                          </div>
                          <Progress
                            value={(quotaInfo.requestsToday / quotaInfo.dailyLimit) * 100}
                            className="h-2"
                            indicatorClassName={quotaInfo.requestsToday >= quotaInfo.dailyLimit ? "bg-red-500" : ""}
                          />
                          {quotaInfo.requestsToday > 0 && (
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Réinitialisation à minuit</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <h4 className="text-sm font-medium mb-1">Dernière mise à jour</h4>
                      <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  API Alpha Vantage gratuite: {quotaInfo?.minuteLimit || 5} requêtes/minute,{" "}
                  {quotaInfo?.dailyLimit || 500} requêtes/jour
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conseils d'Optimisation</CardTitle>
                <CardDescription>Comment maximiser l'utilisation de votre quota d'API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">1. Utiliser le cache efficacement</h3>
                  <p className="text-sm text-muted-foreground">
                    Les données sont mises en cache pendant 15 minutes. Privilégiez l'utilisation des données en cache
                    plutôt que des appels API frais.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">2. Autoriser les données simulées</h3>
                  <p className="text-sm text-muted-foreground">
                    Activez les données simulées pour les utilisateurs non-premium afin d'économiser votre quota pour
                    les requêtes importantes.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">3. Regrouper les requêtes</h3>
                  <p className="text-sm text-muted-foreground">
                    Évitez les rafraîchissements fréquents et regroupez les requêtes similaires pour économiser votre
                    quota.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">4. Passer à un plan premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Pour des limites plus élevées, envisagez de passer à un plan payant Alpha Vantage (à partir de
                    50$/mois).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test d'API Alpha Vantage</CardTitle>
              <CardDescription>Testez un appel d'API pour vérifier la configuration et le quota</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention</AlertTitle>
                  <AlertDescription>
                    Ce test consommera une requête de votre quota API. Utilisez-le avec parcimonie.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button onClick={testApiCall} disabled={testLoading}>
                    {testLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Test en cours...
                      </>
                    ) : (
                      "Tester l'API Alpha Vantage"
                    )}
                  </Button>
                </div>

                {testResponse && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Statut de la réponse:</span>
                      <Badge
                        variant="outline"
                        className={
                          testResponse.status >= 200 && testResponse.status < 300
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }
                      >
                        {testResponse.status}
                      </Badge>
                    </div>

                    {testResponse.status === 429 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Limite d'API dépassée</AlertTitle>
                        <AlertDescription>
                          Vous avez atteint la limite de requêtes API. Veuillez réessayer plus tard.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="font-medium cursor-pointer">Détails de la réponse</summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-[300px]">
                          {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentation API Alpha Vantage</CardTitle>
              <CardDescription>Informations sur l'API et les limites</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h3>À propos d'Alpha Vantage</h3>
              <p>
                Alpha Vantage fournit des API gratuites pour les données boursières en temps réel et historiques, les
                forex, les crypto-monnaies et les indicateurs techniques.
              </p>

              <h4>Limites de l'API Gratuite</h4>
              <ul>
                <li>
                  <strong>5 requêtes par minute</strong>
                </li>
                <li>
                  <strong>500 requêtes par jour</strong>
                </li>
                <li>Support technique limité</li>
              </ul>

              <h4>Options Premium</h4>
              <p>
                Pour des limites plus élevées et des fonctionnalités supplémentaires, Alpha Vantage propose des plans
                premium:
              </p>
              <ul>
                <li>
                  <strong>Basic ($49.99/mois)</strong>: 150 requêtes/min, 5,000 requêtes/jour
                </li>
                <li>
                  <strong>Premium ($99.99/mois)</strong>: 300 requêtes/min, 10,000 requêtes/jour
                </li>
                <li>
                  <strong>Enterprise ($249.99/mois)</strong>: 600 requêtes/min, 20,000 requêtes/jour
                </li>
              </ul>

              <h4>Endpoints API principaux</h4>
              <ul>
                <li>
                  <code>GLOBAL_QUOTE</code>: Prix et volume actuels
                </li>
                <li>
                  <code>TIME_SERIES_DAILY</code>: Données OHLCV quotidiennes
                </li>
                <li>
                  <code>TIME_SERIES_INTRADAY</code>: Données intrajournalières
                </li>
                <li>
                  <code>SMA, EMA, RSI, MACD</code>: Indicateurs techniques
                </li>
              </ul>

              <h4>Liens utiles</h4>
              <ul>
                <li>
                  <a href="https://www.alphavantage.co/documentation/" target="_blank" rel="noopener noreferrer">
                    Documentation officielle
                  </a>
                </li>
                <li>
                  <a href="https://www.alphavantage.co/premium/" target="_blank" rel="noopener noreferrer">
                    Plans premium
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
