import { alertsService, type PriceAlert } from "./alerts-service"
import type { StockData } from "./stock-service"
import type { PredictionResult } from "./prediction-service"
import type { EnhancedPredictionResult } from "./enhanced-prediction-service"

// Types pour les alertes de prédiction
export interface PredictionAlertCondition {
  type: "price-target" | "trend-change" | "volatility" | "confidence" | "sector-trend" | "custom"
  threshold: number
  direction: "above" | "below" | "change"
  timeframe: "short" | "medium" | "long"
}

export interface PredictionAlert extends Omit<PriceAlert, "condition" | "value"> {
  predictionCondition: PredictionAlertCondition
  lastChecked?: Date
  algorithm?: string
}

// Service d'alertes de prédiction
class PredictionAlertsService {
  // Créer une alerte basée sur une prédiction
  async createPredictionAlert(
    stock: StockData,
    prediction: PredictionResult | EnhancedPredictionResult,
    condition: PredictionAlertCondition,
    userId?: string,
  ): Promise<PredictionAlert> {
    // Générer un message approprié
    const message = this.generateAlertMessage(stock.symbol, condition, prediction)

    // Déterminer la date d'expiration en fonction du timeframe
    const expires = this.getExpirationDate(condition.timeframe)

    // Convertir en format compatible avec le service d'alertes existant
    const baseAlert: Omit<PriceAlert, "id" | "created"> = {
      symbol: stock.symbol,
      type: "prediction",
      condition: "prediction", // Utiliser le type existant
      value: condition.threshold,
      message,
      expires,
      userId,
    }

    // Créer l'alerte de base
    const createdAlert = await alertsService.createPriceAlert(baseAlert)

    // Étendre avec les propriétés spécifiques aux prédictions
    const predictionAlert: PredictionAlert = {
      ...createdAlert,
      predictionCondition: condition,
      algorithm: prediction.algorithm,
      lastChecked: new Date(),
    }

    // Stocker les métadonnées supplémentaires
    this.storePredictionAlertMetadata(createdAlert.id, predictionAlert)

    return predictionAlert
  }

  // Vérifier les alertes pour une action et une prédiction données
  async checkPredictionAlerts(
    stock: StockData,
    prediction: PredictionResult | EnhancedPredictionResult,
  ): Promise<PredictionAlert[]> {
    // Récupérer toutes les alertes pour ce symbole
    const allAlerts = await alertsService.getAlerts()
    const stockAlerts = allAlerts.filter(
      (alert) => alert.symbol === stock.symbol && alert.type === "prediction" && !alert.triggered,
    )

    const triggeredAlerts: PredictionAlert[] = []
    const updatedAlerts = await Promise.all(
      stockAlerts.map(async (alert) => {
        // Récupérer les métadonnées de prédiction
        const predictionMetadata = await this.getPredictionAlertMetadata(alert.id)
        if (!predictionMetadata) return alert

        const predictionAlert: PredictionAlert = {
          ...alert,
          predictionCondition: predictionMetadata.predictionCondition,
          algorithm: predictionMetadata.algorithm,
          lastChecked: new Date(),
        }

        // Vérifier si l'alerte doit être déclenchée
        const triggered = this.checkAlertCondition(predictionAlert, prediction)

        if (triggered) {
          // Mettre à jour l'alerte comme déclenchée
          const updatedAlert = {
            ...predictionAlert,
            triggered: true,
          }
          triggeredAlerts.push(updatedAlert)
          return updatedAlert
        }

        return predictionAlert
      }),
    )

    // Mettre à jour les alertes dans le stockage
    this.updateAlerts(updatedAlerts)

    return triggeredAlerts
  }

  // Générer des suggestions d'alertes basées sur une prédiction
  generateAlertSuggestions(
    stock: StockData,
    prediction: PredictionResult | EnhancedPredictionResult,
  ): PredictionAlert[] {
    const suggestions: PredictionAlert[] = []
    const currentPrice = stock.price

    // 1. Alerte sur objectif de prix significatif
    if (prediction.longTermTarget) {
      const changePercent = (prediction.longTermTarget / currentPrice - 1) * 100
      if (Math.abs(changePercent) >= 10) {
        suggestions.push({
          id: `suggestion_price_${Date.now()}`,
          symbol: stock.symbol,
          type: "prediction",
          condition: "prediction",
          value: 10,
          message: `${stock.symbol} pourrait ${
            changePercent > 0 ? "augmenter" : "baisser"
          } de ${Math.abs(changePercent).toFixed(1)}% selon les prédictions`,
          created: new Date(),
          expires: this.getExpirationDate("long"),
          predictionCondition: {
            type: "price-target",
            threshold: 10,
            direction: changePercent > 0 ? "above" : "below",
            timeframe: "long",
          },
          algorithm: prediction.algorithm,
        })
      }
    }

    // 2. Alerte sur changement de tendance
    if (prediction.trend !== "neutral") {
      suggestions.push({
        id: `suggestion_trend_${Date.now()}`,
        symbol: stock.symbol,
        type: "prediction",
        condition: "prediction",
        value: prediction.trend === "up" ? 5 : -5,
        message: `Tendance ${prediction.trend === "up" ? "haussière" : "baissière"} prédite pour ${stock.symbol}`,
        created: new Date(),
        expires: this.getExpirationDate("medium"),
        predictionCondition: {
          type: "trend-change",
          threshold: 5,
          direction: "change",
          timeframe: "medium",
        },
        algorithm: prediction.algorithm,
      })
    }

    // 3. Alerte sur forte confiance
    if (prediction.metrics && prediction.metrics.confidence && prediction.metrics.confidence > 0.8) {
      suggestions.push({
        id: `suggestion_confidence_${Date.now()}`,
        symbol: stock.symbol,
        type: "prediction",
        condition: "prediction",
        value: prediction.metrics.confidence * 100,
        message: `Prédiction à haute confiance (${(prediction.metrics.confidence * 100).toFixed(
          0,
        )}%) pour ${stock.symbol}`,
        created: new Date(),
        expires: this.getExpirationDate("short"),
        predictionCondition: {
          type: "confidence",
          threshold: 80,
          direction: "above",
          timeframe: "short",
        },
        algorithm: prediction.algorithm,
      })
    }

    // 4. Alerte sur analyse technique (si disponible)
    if (
      "technicalAnalysis" in prediction &&
      prediction.technicalAnalysis &&
      prediction.technicalAnalysis.strength > 0.7
    ) {
      suggestions.push({
        id: `suggestion_technical_${Date.now()}`,
        symbol: stock.symbol,
        type: "prediction",
        condition: "prediction",
        value: prediction.technicalAnalysis.strength * 100,
        message: `Signal technique ${
          prediction.technicalAnalysis.trend === "up" ? "haussier" : "baissier"
        } fort pour ${stock.symbol}`,
        created: new Date(),
        expires: this.getExpirationDate("short"),
        predictionCondition: {
          type: "trend-change",
          threshold: 70,
          direction: prediction.technicalAnalysis.trend === "up" ? "above" : "below",
          timeframe: "short",
        },
        algorithm: prediction.algorithm,
      })
    }

    return suggestions
  }

  // Méthodes privées
  private checkAlertCondition(
    alert: PredictionAlert,
    prediction: PredictionResult | EnhancedPredictionResult,
  ): boolean {
    const { predictionCondition } = alert
    const { type, threshold, direction, timeframe } = predictionCondition

    switch (type) {
      case "price-target": {
        // Déterminer la cible de prix en fonction du timeframe
        const targetPrice =
          timeframe === "short"
            ? prediction.shortTermTarget
            : timeframe === "medium"
              ? prediction.shortTermTarget // Utiliser short comme medium pour simplifier
              : prediction.longTermTarget

        if (!targetPrice) return false

        const currentPrice = prediction.points.find((p) => !p.isEstimate)?.price || 0
        const changePercent = (targetPrice / currentPrice - 1) * 100

        if (direction === "above") return changePercent > threshold
        if (direction === "below") return changePercent < -threshold
        return Math.abs(changePercent) > threshold
      }

      case "trend-change":
        if (direction === "change") {
          // Vérifier si la tendance a changé significativement
          return prediction.trend !== "neutral"
        }
        return prediction.trend === (direction === "above" ? "up" : "down")

      case "volatility":
        if (!prediction.metrics || !prediction.metrics.volatility) return false
        if (direction === "above") return prediction.metrics.volatility * 100 > threshold
        if (direction === "below") return prediction.metrics.volatility * 100 < threshold
        return true

      case "confidence":
        if (!prediction.metrics || !prediction.metrics.confidence) return false
        if (direction === "above") return prediction.metrics.confidence * 100 > threshold
        if (direction === "below") return prediction.metrics.confidence * 100 < threshold
        return true

      case "sector-trend":
        // Vérifier si des informations sectorielles sont disponibles
        if (!("sector" in prediction) || !prediction.sector) return false
        // Cette vérification nécessiterait des données sectorielles supplémentaires
        return false

      case "custom":
        // Pour les alertes personnalisées, la logique dépendrait de l'implémentation
        return false

      default:
        return false
    }
  }

  private generateAlertMessage(
    symbol: string,
    condition: PredictionAlertCondition,
    prediction: PredictionResult | EnhancedPredictionResult,
  ): string {
    const { type, threshold, direction, timeframe } = condition
    const timeframeText = timeframe === "short" ? "court terme" : timeframe === "medium" ? "moyen terme" : "long terme"

    switch (type) {
      case "price-target":
        return `${symbol} pourrait ${
          direction === "above" ? "augmenter de" : direction === "below" ? "baisser de" : "varier de"
        } ${threshold}% à ${timeframeText} selon les prédictions`

      case "trend-change":
        return `Tendance ${
          direction === "above" ? "haussière" : direction === "below" ? "baissière" : "changeante"
        } prédite pour ${symbol} à ${timeframeText}`

      case "volatility":
        return `Volatilité ${direction === "above" ? "élevée" : "faible"} prédite pour ${symbol} (seuil: ${threshold}%)`

      case "confidence":
        return `Prédiction à ${direction === "above" ? "haute" : "faible"} confiance (${threshold}%) pour ${symbol}`

      case "sector-trend":
        if ("sector" in prediction && prediction.sector) {
          return `Tendance sectorielle (${prediction.sector}) ${
            direction === "above" ? "positive" : "négative"
          } pour ${symbol}`
        }
        return `Alerte de tendance sectorielle pour ${symbol}`

      case "custom":
        return `Alerte personnalisée pour ${symbol}: seuil de ${threshold}% ${
          direction === "above" ? "dépassé" : "non atteint"
        }`

      default:
        return `Alerte de prédiction pour ${symbol}`
    }
  }

  private getExpirationDate(timeframe: "short" | "medium" | "long"): Date {
    const now = new Date()
    switch (timeframe) {
      case "short":
        now.setDate(now.getDate() + 7) // 1 semaine
        break
      case "medium":
        now.setDate(now.getDate() + 30) // 1 mois
        break
      case "long":
        now.setDate(now.getDate() + 90) // 3 mois
        break
    }
    return now
  }

  // Méthodes de stockage des métadonnées (utilisant localStorage pour simplifier)
  private storePredictionAlertMetadata(alertId: string, alert: PredictionAlert): void {
    if (typeof window === "undefined") return

    const storageKey = `prediction_alert_${alertId}`
    const metadata = {
      predictionCondition: alert.predictionCondition,
      algorithm: alert.algorithm,
    }
    localStorage.setItem(storageKey, JSON.stringify(metadata))
  }

  private async getPredictionAlertMetadata(alertId: string): Promise<Partial<PredictionAlert> | null> {
    if (typeof window === "undefined") return null

    const storageKey = `prediction_alert_${alertId}`
    const metadataJson = localStorage.getItem(storageKey)
    if (!metadataJson) return null

    try {
      return JSON.parse(metadataJson)
    } catch (error) {
      console.error("Error parsing prediction alert metadata:", error)
      return null
    }
  }

  private updateAlerts(alerts: (PriceAlert | PredictionAlert)[]): void {
    if (typeof window === "undefined") return

    // Mettre à jour les alertes de base
    const baseAlerts = alerts.map((alert) => {
      // Extraire uniquement les propriétés de PriceAlert
      const { id, symbol, type, condition, value, message, created, expires, triggered, userId, notificationSent } =
        alert
      return {
        id,
        symbol,
        type,
        condition,
        value,
        message,
        created,
        expires,
        triggered,
        userId,
        notificationSent,
      }
    })

    // Stocker dans localStorage via le service existant
    localStorage.setItem("stock_alerts", JSON.stringify(baseAlerts))

    // Mettre à jour les métadonnées pour les alertes de prédiction
    alerts.forEach((alert) => {
      if ("predictionCondition" in alert) {
        this.storePredictionAlertMetadata(alert.id, alert as PredictionAlert)
      }
    })
  }
}

// Exporter l'instance du service
export const predictionAlertsService = new PredictionAlertsService()
