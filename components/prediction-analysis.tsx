"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { BarChart, TrendingUp, TrendingDown, Activity, Globe, MessageCircle, AlertTriangle } from "lucide-react"
import type { EnhancedPredictionResult } from "@/lib/enhanced-prediction-service"

interface PredictionAnalysisProps {
  prediction: EnhancedPredictionResult
}

export function PredictionAnalysis({ prediction }: PredictionAnalysisProps) {
  const [expanded, setExpanded] = useState<string>("technical")

  // Déterminer les types d'analyses disponibles
  const hasPerformance = !!prediction.metrics
  const hasPerformanceDetails =
    hasPerformance && (prediction.metrics.accuracy !== undefined || prediction.metrics.confidence !== undefined)

  const hasTechnical = !!prediction.technicalAnalysis
  const hasMacro = !!prediction.macroeconomicAnalysis
  const hasSentiment = !!prediction.sentimentAnalysis

  // Déterminer la recommandation globale basée sur toutes les analyses disponibles
  let recommendation: "achat" | "vente" | "conserver" = "conserver"
  const upFactors: Array<{ name: string; strength: number }> = []
  const downFactors: Array<{ name: string; strength: number }> = []

  if (prediction.trend === "up") {
    upFactors.push({ name: "Tendance", strength: 0.7 })
  } else if (prediction.trend === "down") {
    downFactors.push({ name: "Tendance", strength: 0.7 })
  }

  if (hasTechnical) {
    if (prediction.technicalAnalysis!.trend === "up") {
      upFactors.push({ name: "Technique", strength: prediction.technicalAnalysis!.strength })
    } else if (prediction.technicalAnalysis!.trend === "down") {
      downFactors.push({ name: "Technique", strength: prediction.technicalAnalysis!.strength })
    }
  }

  if (hasMacro) {
    if (prediction.macroeconomicAnalysis!.impact === "positive") {
      upFactors.push({ name: "Macroéconomie", strength: prediction.macroeconomicAnalysis!.strength })
    } else if (prediction.macroeconomicAnalysis!.impact === "negative") {
      downFactors.push({ name: "Macroéconomie", strength: prediction.macroeconomicAnalysis!.strength })
    }
  }

  if (hasSentiment) {
    if (prediction.sentimentAnalysis!.impact === "positive") {
      upFactors.push({ name: "Sentiment", strength: prediction.sentimentAnalysis!.strength })
    } else if (prediction.sentimentAnalysis!.impact === "negative") {
      downFactors.push({ name: "Sentiment", strength: prediction.sentimentAnalysis!.strength })
    }
  }

  // Calculer le score global
  const upScore = upFactors.reduce((acc, factor) => acc + factor.strength, 0)
  const downScore = downFactors.reduce((acc, factor) => acc + factor.strength, 0)

  let scoreRatio = 0
  if (upScore > 0 || downScore > 0) {
    scoreRatio = (upScore - downScore) / (upScore + downScore)
  }

  // Déterminer la recommandation
  if (scoreRatio > 0.3) {
    recommendation = "achat"
  } else if (scoreRatio < -0.3) {
    recommendation = "vente"
  } else {
    recommendation = "conserver"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analyse multi-factorielle</span>
          <Badge
            variant={recommendation === "achat" ? "success" : recommendation === "vente" ? "destructive" : "outline"}
            className="ml-2"
          >
            {recommendation === "achat" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : recommendation === "vente" ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <Activity className="h-3 w-3 mr-1" />
            )}
            {recommendation.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" defaultValue={expanded} onValueChange={setExpanded} className="space-y-2">
          {hasTechnical && (
            <AccordionItem value="technical" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  <span>Analyse technique</span>
                  <Badge
                    variant={
                      prediction.technicalAnalysis?.trend === "up"
                        ? "success"
                        : prediction.technicalAnalysis?.trend === "down"
                          ? "destructive"
                          : "outline"
                    }
                    className="ml-2"
                  >
                    {prediction.technicalAnalysis?.trend === "up"
                      ? "HAUSSIER"
                      : prediction.technicalAnalysis?.trend === "down"
                        ? "BAISSIER"
                        : "NEUTRE"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prediction.technicalAnalysis?.signals.map((signal, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-sm">
                        <span>{signal.name}</span>
                        <Badge
                          variant={
                            signal.signal === "buy" ? "success" : signal.signal === "sell" ? "destructive" : "outline"
                          }
                          className="text-xs"
                        >
                          {signal.signal === "buy" ? "ACHAT" : signal.signal === "sell" ? "VENTE" : "NEUTRE"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasMacro && (
            <AccordionItem value="macro" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Facteurs macroéconomiques</span>
                  <Badge
                    variant={
                      prediction.macroeconomicAnalysis?.impact === "positive"
                        ? "success"
                        : prediction.macroeconomicAnalysis?.impact === "negative"
                          ? "destructive"
                          : "outline"
                    }
                    className="ml-2"
                  >
                    {prediction.macroeconomicAnalysis?.impact === "positive"
                      ? "POSITIF"
                      : prediction.macroeconomicAnalysis?.impact === "negative"
                        ? "NÉGATIF"
                        : "NEUTRE"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="text-sm space-y-2">
                  <p>{prediction.macroeconomicAnalysis?.details}</p>
                  <div className="mt-2 h-1 bg-muted rounded-full">
                    <div
                      className={`h-1 rounded-full ${
                        prediction.macroeconomicAnalysis?.impact === "positive"
                          ? "bg-green-500"
                          : prediction.macroeconomicAnalysis?.impact === "negative"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${(prediction.macroeconomicAnalysis?.strength || 0) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasSentiment && (
            <AccordionItem value="sentiment" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Analyse de sentiment</span>
                  <Badge
                    variant={
                      prediction.sentimentAnalysis?.impact === "positive"
                        ? "success"
                        : prediction.sentimentAnalysis?.impact === "negative"
                          ? "destructive"
                          : "outline"
                    }
                    className="ml-2"
                  >
                    {prediction.sentimentAnalysis?.impact === "positive"
                      ? "POSITIF"
                      : prediction.sentimentAnalysis?.impact === "negative"
                        ? "NÉGATIF"
                        : "NEUTRE"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="text-sm space-y-2">
                  <p>{prediction.sentimentAnalysis?.details}</p>
                  <div className="mt-2 h-1 bg-muted rounded-full">
                    <div
                      className={`h-1 rounded-full ${
                        prediction.sentimentAnalysis?.impact === "positive"
                          ? "bg-green-500"
                          : prediction.sentimentAnalysis?.impact === "negative"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${(prediction.sentimentAnalysis?.strength || 0) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasPerformanceDetails && (
            <AccordionItem value="metrics" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Fiabilité du modèle</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="text-sm space-y-2">
                  {prediction.metrics.accuracy !== undefined && (
                    <div className="flex justify-between items-center">
                      <span>Précision historique:</span>
                      <span className="font-medium">{(prediction.metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {prediction.metrics.confidence !== undefined && (
                    <div className="flex justify-between items-center">
                      <span>Niveau de confiance:</span>
                      <span className="font-medium">{(prediction.metrics.confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {prediction.metrics.volatility !== undefined && (
                    <div className="flex justify-between items-center">
                      <span>Volatilité observée:</span>
                      <span className="font-medium">{(prediction.metrics.volatility * 100).toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p>
            Cette analyse combine des facteurs techniques, macroéconomiques et de sentiment pour évaluer les
            perspectives du titre. Pour des décisions d'investissement, consultez un conseiller financier.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
