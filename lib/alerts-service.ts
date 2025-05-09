import type { StockData } from "./stock-service"
import type { EnhancedPredictionResult } from "./enhanced-prediction-service"

// Types pour les alertes
export interface PriceAlert {
  id: string
  symbol: string
  type: "price" | "prediction" | "technical" | "custom"
  condition: "above" | "below" | "change" | "prediction" | "technical"
  value: number
  message: string
  created: Date
  expires?: Date
  triggered?: boolean
  userId?: string
  notificationSent?: boolean
}

// Interface pour le service d'alertes
export interface AlertsService {
  createPriceAlert(alert: Omit<PriceAlert, "id" | "created">): Promise<PriceAlert>
  deleteAlert(id: string): Promise<boolean>
  getAlerts(userId?: string): Promise<PriceAlert[]>
  checkAlerts(stock: StockData): Promise<PriceAlert[]>
}

// Mise en œuvre avec stockage localStorage
class LocalAlertsService implements AlertsService {
  private readonly STORAGE_KEY = "stock_alerts"

  // Créer une alerte
  async createPriceAlert(alert: Omit<PriceAlert, "id" | "created">): Promise<PriceAlert> {
    const alerts = await this.getAlerts()

    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created: new Date(),
      triggered: false,
      notificationSent: false,
    }

    alerts.push(newAlert)
    this.saveAlerts(alerts)

    return newAlert
  }

  // Supprimer une alerte
  async deleteAlert(id: string): Promise<boolean> {
    const alerts = await this.getAlerts()
    const filteredAlerts = alerts.filter((alert) => alert.id !== id)

    if (filteredAlerts.length !== alerts.length) {
      this.saveAlerts(filteredAlerts)
      return true
    }

    return false
  }

  // Récupérer toutes les alertes
  async getAlerts(userId?: string): Promise<PriceAlert[]> {
    if (typeof window === "undefined") {
      return []
    }

    const alertsJson = localStorage.getItem(this.STORAGE_KEY)
    if (!alertsJson) {
      return []
    }

    try {
      const alerts = JSON.parse(alertsJson) as PriceAlert[]
      // Filtrer par utilisateur si spécifié
      return userId ? alerts.filter((alert) => alert.userId === userId) : alerts
    } catch (error) {
      console.error("Error parsing alerts:", error)
      return []
    }
  }

  // Vérifier les alertes pour une action donnée
  async checkAlerts(stock: StockData): Promise<PriceAlert[]> {
    const alerts = await this.getAlerts()
    const triggeredAlerts: PriceAlert[] = []

    const updatedAlerts = alerts.map((alert) => {
      if (alert.symbol !== stock.symbol || alert.triggered || (alert.expires && new Date(alert.expires) < new Date())) {
        return alert
      }

      let triggered = false

      switch (alert.condition) {
        case "above":
          triggered = stock.price > alert.value
          break
        case "below":
          triggered = stock.price < alert.value
          break
        case "change":
          triggered = Math.abs(stock.percentChange) > alert.value
          break
        case "prediction":
        case "technical":
          // Ces types sont vérifiés séparément avec des prédictions
          break
      }

      if (triggered) {
        const updatedAlert = {
          ...alert,
          triggered: true,
        }
        triggeredAlerts.push(updatedAlert)
        return updatedAlert
      }

      return alert
    })

    this.saveAlerts(updatedAlerts)
    return triggeredAlerts
  }

  // Vérifier les alertes basées sur des prédictions
  async checkPredictionAlerts(stock: StockData, prediction: EnhancedPredictionResult): Promise<PriceAlert[]> {
    const alerts = await this.getAlerts()
    const triggeredAlerts: PriceAlert[] = []

    const updatedAlerts = alerts.map((alert) => {
      if (alert.symbol !== stock.symbol || alert.triggered || (alert.expires && new Date(alert.expires) < new Date())) {
        return alert
      }

      let triggered = false

      if (alert.condition === "prediction") {
        // Alerte basée sur un changement prédit significatif
        const lastActualPrice = stock.price
        const predictedPrice = prediction.longTermTarget || 0
        const predictedChange = (predictedPrice / lastActualPrice - 1) * 100

        if (alert.type === "prediction" && Math.abs(predictedChange) > alert.value) {
          triggered = true
        }
      } else if (alert.condition === "technical" && prediction.technicalAnalysis) {
        // Alerte basée sur l'analyse technique
        const { trend, strength } = prediction.technicalAnalysis

        if (alert.type === "technical" && strength > alert.value) {
          if ((trend === "up" && alert.value > 0) || (trend === "down" && alert.value < 0)) {
            triggered = true
          }
        }
      }

      if (triggered) {
        const updatedAlert = {
          ...alert,
          triggered: true,
        }
        triggeredAlerts.push(updatedAlert)
        return updatedAlert
      }

      return alert
    })

    this.saveAlerts(updatedAlerts)
    return triggeredAlerts
  }

  // Sauvegarder les alertes dans le localStorage
  private saveAlerts(alerts: PriceAlert[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(alerts))
    }
  }
}

// Exporter l'instance du service
export const alertsService = new LocalAlertsService()

// Générer des suggestions d'alertes basées sur l'analyse technique
export function generateAlertSuggestions(
  stock: StockData,
  prediction: EnhancedPredictionResult,
): Omit<PriceAlert, "id" | "created">[] {
  const suggestions: Omit<PriceAlert, "id" | "created">[] = []

  // Vérifier que nous avons des prédictions et une analyse technique
  if (!prediction || !prediction.technicalAnalysis) {
    return suggestions
  }

  const currentPrice = stock.price
  const shortTermTarget = prediction.shortTermTarget
  const longTermTarget = prediction.longTermTarget
  const technicalAnalysis = prediction.technicalAnalysis

  // 1. Alerte de prix basée sur l'objectif à court terme (7 jours)
  if (shortTermTarget) {
    const changePercent = (shortTermTarget / currentPrice - 1) * 100

    if (Math.abs(changePercent) >= 5) {
      suggestions.push({
        symbol: stock.symbol,
        type: "prediction",
        condition: "prediction",
        value: 5,
        message: `${stock.symbol} pourrait ${changePercent > 0 ? "augmenter" : "baisser"} de ${Math.abs(changePercent).toFixed(1)}% dans 7 jours selon les prédictions`,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      })
    }
  }

  // 2. Alerte basée sur un fort signal technique
  if (technicalAnalysis.strength >= 0.7) {
    suggestions.push({
      symbol: stock.symbol,
      type: "technical",
      condition: "technical",
      value: technicalAnalysis.trend === "up" ? 0.7 : -0.7,
      message: `${stock.symbol} montre un fort signal technique ${technicalAnalysis.trend === "up" ? "haussier" : "baissier"}`,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
    })
  }

  // 3. Alerte de prix basée sur la résistance ou le support
  const supportPrice = currentPrice * 0.95 // -5%
  const resistancePrice = currentPrice * 1.05 // +5%

  suggestions.push({
    symbol: stock.symbol,
    type: "price",
    condition: "below",
    value: supportPrice,
    message: `${stock.symbol} a atteint un niveau de support à ${supportPrice.toFixed(2)}`,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
  })

  suggestions.push({
    symbol: stock.symbol,
    type: "price",
    condition: "above",
    value: resistancePrice,
    message: `${stock.symbol} a franchi un niveau de résistance à ${resistancePrice.toFixed(2)}`,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
  })

  return suggestions
}
