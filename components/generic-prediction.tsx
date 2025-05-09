"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertCircle, RefreshCw, Lightbulb, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  type GenericPredictionRequest,
  type GenericPredictionResponse,
  predictionTemplates,
} from "@/lib/generic-ai-prediction-service"

interface GenericPredictionProps {
  defaultTemplate?: "stockPrice" | "economicTrend" | "marketEvent" | "customScenario" | "custom"
  defaultContext?: string
  defaultQuestion?: string
  defaultTimeframe?: string
  defaultHistoricalData?: any[]
  defaultCurrentData?: any
}

export function GenericPrediction({
  defaultTemplate = "custom",
  defaultContext = "",
  defaultQuestion = "",
  defaultTimeframe = "",
  defaultHistoricalData = [],
  defaultCurrentData = {},
}: GenericPredictionProps) {
  // État pour le formulaire
  const [template, setTemplate] = useState(defaultTemplate)
  const [context, setContext] = useState(defaultContext)
  const [question, setQuestion] = useState(defaultQuestion)
  const [timeframe, setTimeframe] = useState(defaultTimeframe)
  const [historicalData, setHistoricalData] = useState<string>(
    defaultHistoricalData.length > 0 ? JSON.stringify(defaultHistoricalData, null, 2) : "",
  )
  const [currentData, setCurrentData] = useState<string>(
    Object.keys(defaultCurrentData).length > 0 ? JSON.stringify(defaultCurrentData, null, 2) : "",
  )
  const [additionalContext, setAdditionalContext] = useState("")
  const [responseFormat, setResponseFormat] = useState<"json" | "text" | "structured">("json")
  const [detailLevel, setDetailLevel] = useState<"brief" | "standard" | "detailed">("standard")
  const [confidenceRequired, setConfidenceRequired] = useState(true)
  const [scenariosRequired, setScenariosRequired] = useState(true)

  // État pour la prédiction
  const [prediction, setPrediction] = useState<GenericPredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("form")

  // Fonction pour appliquer un template
  const applyTemplate = (templateName: string) => {
    setTemplate(templateName as any)

    if (templateName === "custom") {
      // Ne rien faire, garder les valeurs actuelles
      return
    }

    // Récupérer le template
    let templateData: GenericPredictionRequest | null = null

    switch (templateName) {
      case "stockPrice":
        templateData = predictionTemplates.stockPrice("AAPL", "Apple Inc.", 150.0, [])
        break
      case "economicTrend":
        templateData = predictionTemplates.economicTrend("Technologie", "États-Unis", [])
        break
      case "marketEvent":
        templateData = predictionTemplates.marketEvent("Annonce de la Fed", "Actions américaines", "")
        break
      case "customScenario":
        templateData = predictionTemplates.customScenario("", "", "")
        break
    }

    if (templateData) {
      setContext(templateData.context)
      setQuestion(templateData.question)
      setTimeframe(templateData.timeframe || "")
      setHistoricalData(templateData.historicalData ? JSON.stringify(templateData.historicalData, null, 2) : "")
      setCurrentData(templateData.currentData ? JSON.stringify(templateData.currentData, null, 2) : "")
      setAdditionalContext(templateData.additionalContext || "")
      setResponseFormat(templateData.responseFormat || "json")
      setDetailLevel(templateData.detailLevel || "standard")
      setConfidenceRequired(templateData.confidenceRequired || true)
      setScenariosRequired(templateData.scenariosRequired || true)
    }
  }

  // Fonction pour générer la prédiction
  const generatePrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      // Préparer la requête
      const request: GenericPredictionRequest = {
        context,
        question,
        timeframe: timeframe || undefined,
        historicalData: historicalData ? JSON.parse(historicalData) : undefined,
        currentData: currentData ? JSON.parse(currentData) : undefined,
        additionalContext: additionalContext || undefined,
        responseFormat,
        detailLevel,
        confidenceRequired,
        scenariosRequired,
      }

      // Appeler l'API
      const response = await fetch("/api/predictions/generic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      setPrediction(data)
      setActiveTab("result")
    } catch (err) {
      console.error("Erreur lors de la génération de prédiction:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour formater la confiance
  const formatConfidence = (confidence?: number) => {
    if (confidence === undefined) return "N/A"
    return `${Math.round(confidence * 100)}%`
  }

  // Déterminer l'icône de tendance
  const getTrendIcon = (prediction: GenericPredictionResponse) => {
    if (!prediction.prediction) return <Minus className="h-4 w-4" />

    const text = prediction.prediction.toLowerCase()
    if (
      text.includes("hausse") ||
      text.includes("augmentation") ||
      text.includes("croissance") ||
      text.includes("positif")
    ) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (
      text.includes("baisse") ||
      text.includes("diminution") ||
      text.includes("déclin") ||
      text.includes("négatif")
    ) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          Prédiction IA avancée
        </CardTitle>
        <CardDescription>Générez des prédictions IA sur n'importe quel sujet ou scénario</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="form">Formulaire</TabsTrigger>
            <TabsTrigger value="result" disabled={!prediction}>
              Résultat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Template</Label>
                <Select value={template} onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                    <SelectItem value="stockPrice">Prix d'action</SelectItem>
                    <SelectItem value="economicTrend">Tendance économique</SelectItem>
                    <SelectItem value="marketEvent">Événement de marché</SelectItem>
                    <SelectItem value="customScenario">Scénario hypothétique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="context">Contexte</Label>
                <Textarea
                  id="context"
                  placeholder="Décrivez le contexte de votre prédiction..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="question">Question / Sujet</Label>
                <Textarea
                  id="question"
                  placeholder="Quelle est votre question ou le sujet de la prédiction?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="timeframe">Période de temps</Label>
                <Input
                  id="timeframe"
                  placeholder="Ex: 30 jours, 6 mois, 1 an..."
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="historicalData">Données historiques (JSON)</Label>
                  <Textarea
                    id="historicalData"
                    placeholder="[{ ... }]"
                    value={historicalData}
                    onChange={(e) => setHistoricalData(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="currentData">Données actuelles (JSON)</Label>
                  <Textarea
                    id="currentData"
                    placeholder="{ ... }"
                    value={currentData}
                    onChange={(e) => setCurrentData(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="additionalContext">Contexte supplémentaire</Label>
                <Textarea
                  id="additionalContext"
                  placeholder="Informations supplémentaires pertinentes..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responseFormat">Format de réponse</Label>
                  <Select value={responseFormat} onValueChange={(value) => setResponseFormat(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="text">Texte</SelectItem>
                      <SelectItem value="structured">Structuré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="detailLevel">Niveau de détail</Label>
                  <Select value={detailLevel} onValueChange={(value) => setDetailLevel(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Bref</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Détaillé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="confidenceRequired"
                      checked={confidenceRequired}
                      onCheckedChange={setConfidenceRequired}
                    />
                    <Label htmlFor="confidenceRequired">Niveau de confiance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="scenariosRequired" checked={scenariosRequired} onCheckedChange={setScenariosRequired} />
                    <Label htmlFor="scenariosRequired">Scénarios multiples</Label>
                  </div>
                </div>
              </div>

              <Button onClick={generatePrediction} disabled={loading || !context || !question} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Générer la prédiction
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="result">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : prediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Résultat de la prédiction</h3>
                  <Badge variant="outline" className="flex items-center">
                    {getTrendIcon(prediction)}
                    <span className="ml-1">Confiance: {formatConfidence(prediction.confidence)}</span>
                  </Badge>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start mb-2">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Prédiction</h4>
                      <p className="mt-1">{prediction.prediction}</p>
                    </div>
                  </div>
                </div>

                {prediction.reasoning && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Raisonnement</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{prediction.reasoning}</p>
                  </div>
                )}

                {prediction.scenarios && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Scénarios</h4>

                    {prediction.scenarios.optimistic && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h5 className="text-sm font-medium text-green-800 mb-1">Scénario optimiste</h5>
                        <p className="text-sm text-green-700">{prediction.scenarios.optimistic}</p>
                      </div>
                    )}

                    {prediction.scenarios.neutral && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">Scénario neutre</h5>
                        <p className="text-sm text-blue-700">{prediction.scenarios.neutral}</p>
                      </div>
                    )}

                    {prediction.scenarios.pessimistic && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Scénario pessimiste</h5>
                        <p className="text-sm text-red-700">{prediction.scenarios.pessimistic}</p>
                      </div>
                    )}

                    {/* Autres scénarios personnalisés */}
                    {Object.entries(prediction.scenarios)
                      .filter(([key]) => !["optimistic", "neutral", "pessimistic"].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <h5 className="text-sm font-medium text-gray-800 mb-1">Scénario: {key}</h5>
                          <p className="text-sm text-gray-700">{value}</p>
                        </div>
                      ))}
                  </div>
                )}

                {prediction.structuredData && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Données structurées</h4>
                    <pre className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-auto text-xs">
                      {JSON.stringify(prediction.structuredData, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Généré le: {new Date(prediction.timestamp).toLocaleString()}</span>
                  <span>Modèle: {prediction.model}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">Aucune prédiction générée</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("form")} className="mt-2">
                  Retour au formulaire
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Système de prédiction IA avancé</span>
        <span>Powered by GPT-4o</span>
      </CardFooter>
    </Card>
  )
}
