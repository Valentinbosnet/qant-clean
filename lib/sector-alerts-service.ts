import { getFromCache } from "./cache-utils"
import type { SectorType } from "./sector-classification"
import type { SectorMacroeconomicData } from "./sector-macroeconomic-service"
import { getSectorMacroeconomicData } from "./sector-macroeconomic-service"
import { alertsService } from "./alerts-service"

// Types pour les alertes sectorielles
export interface SectorAlert {
  id: string
  sector: SectorType
  indicatorName: string
  previousValue: number
  newValue: number
  changePercent: number
  impact: "positive" | "negative" | "neutral"
  importance: "high" | "medium" | "low"
  message: string
  created: Date
  read: boolean
  userId?: string
}

// Interface pour les préférences d'alertes sectorielles
export interface SectorAlertPreferences {
  userId?: string
  enabledSectors: SectorType[]
  minChangeThreshold: number
  minImportanceLevel: "high" | "medium" | "low"
  notificationChannels: {
    inApp: boolean
    email: boolean
    push: boolean
  }
}

// Classe pour gérer les alertes sectorielles
export class SectorAlertsService {
  private readonly ALERTS_STORAGE_KEY = "sector_alerts"
  private readonly PREFERENCES_STORAGE_KEY = "sector_alert_preferences"
  private readonly LAST_CHECK_STORAGE_KEY = "sector_alerts_last_check"

  // Récupérer toutes les alertes sectorielles
  async getAlerts(userId?: string): Promise<SectorAlert[]> {
    if (typeof window === "undefined") {
      return []
    }

    const alertsJson = localStorage.getItem(this.ALERTS_STORAGE_KEY)
    if (!alertsJson) {
      return []
    }

    try {
      const alerts = JSON.parse(alertsJson) as SectorAlert[]
      // Filtrer par utilisateur si spécifié
      return userId ? alerts.filter((alert) => alert.userId === userId) : alerts
    } catch (error) {
      console.error("Error parsing sector alerts:", error)
      return []
    }
  }

  // Récupérer les alertes non lues
  async getUnreadAlerts(userId?: string): Promise<SectorAlert[]> {
    const alerts = await this.getAlerts(userId)
    return alerts.filter((alert) => !alert.read)
  }

  // Marquer une alerte comme lue
  async markAlertAsRead(alertId: string): Promise<boolean> {
    const alerts = await this.getAlerts()
    const updatedAlerts = alerts.map((alert) => {
      if (alert.id === alertId) {
        return { ...alert, read: true }
      }
      return alert
    })

    this.saveAlerts(updatedAlerts)
    return true
  }

  // Marquer toutes les alertes comme lues
  async markAllAlertsAsRead(userId?: string): Promise<boolean> {
    const alerts = await this.getAlerts()
    const updatedAlerts = alerts.map((alert) => {
      if (!userId || alert.userId === userId) {
        return { ...alert, read: true }
      }
      return alert
    })

    this.saveAlerts(updatedAlerts)
    return true
  }

  // Supprimer une alerte
  async deleteAlert(alertId: string): Promise<boolean> {
    const alerts = await this.getAlerts()
    const filteredAlerts = alerts.filter((alert) => alert.id !== alertId)

    if (filteredAlerts.length !== alerts.length) {
      this.saveAlerts(filteredAlerts)
      return true
    }

    return false
  }

  // Créer une nouvelle alerte sectorielle
  async createAlert(alert: Omit<SectorAlert, "id" | "created" | "read">): Promise<SectorAlert> {
    const alerts = await this.getAlerts()

    const newAlert: SectorAlert = {
      ...alert,
      id: `sector_alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created: new Date(),
      read: false,
    }

    alerts.push(newAlert)
    this.saveAlerts(alerts)

    return newAlert
  }

  // Vérifier les changements dans les indicateurs sectoriels
  async checkSectorIndicators(userId?: string): Promise<SectorAlert[]> {
    const preferences = await this.getPreferences(userId)
    const newAlerts: SectorAlert[] = []

    // Si aucun secteur n'est activé, ne rien faire
    if (preferences.enabledSectors.length === 0) {
      return []
    }

    // Récupérer la date du dernier contrôle
    const lastCheckJson = localStorage.getItem(this.LAST_CHECK_STORAGE_KEY)
    const lastCheck = lastCheckJson ? new Date(JSON.parse(lastCheckJson)) : new Date(0)

    // Mettre à jour la date du dernier contrôle
    localStorage.setItem(this.LAST_CHECK_STORAGE_KEY, JSON.stringify(new Date()))

    // Pour chaque secteur activé, vérifier les changements
    for (const sector of preferences.enabledSectors) {
      try {
        // Récupérer les données actuelles
        const currentData = await getSectorMacroeconomicData(sector, "US", true)

        // Récupérer les données précédentes du cache
        const cacheKey = `sector_macro_${sector}_US`
        const previousData = getFromCache<SectorMacroeconomicData>(cacheKey)

        // Si nous n'avons pas de données précédentes, passer au secteur suivant
        if (!previousData) {
          continue
        }

        // Comparer les indicateurs
        for (const currentIndicator of currentData.indicators) {
          const previousIndicator = previousData.indicators.find((i) => i.name === currentIndicator.name)

          // Si l'indicateur n'existait pas avant ou n'a pas de valeur, passer
          if (!previousIndicator || previousIndicator.value === undefined || currentIndicator.value === undefined) {
            continue
          }

          // Calculer le changement en pourcentage
          const changePercent =
            previousIndicator.value !== 0
              ? ((currentIndicator.value - previousIndicator.value) / Math.abs(previousIndicator.value)) * 100
              : 0

          // Si le changement est inférieur au seuil, passer
          if (Math.abs(changePercent) < preferences.minChangeThreshold) {
            continue
          }

          // Déterminer l'importance de l'alerte basée sur la pertinence de l'indicateur
          const importance = this.getImportanceLevel(currentIndicator.relevance)

          // Si l'importance est inférieure au niveau minimum, passer
          if (this.getImportancePriority(importance) < this.getImportancePriority(preferences.minImportanceLevel)) {
            continue
          }

          // Créer un message d'alerte
          const direction = changePercent > 0 ? "augmenté" : "diminué"
          const message = `L'indicateur "${currentIndicator.name}" pour le secteur ${this.getSectorName(
            sector,
          )} a ${direction} de ${Math.abs(changePercent).toFixed(1)}% (${previousIndicator.value.toFixed(
            2,
          )} → ${currentIndicator.value.toFixed(2)})`

          // Créer une nouvelle alerte
          const newAlert = await this.createAlert({
            sector,
            indicatorName: currentIndicator.name,
            previousValue: previousIndicator.value,
            newValue: currentIndicator.value,
            changePercent,
            impact: currentIndicator.sectorImpact,
            importance,
            message,
            userId,
          })

          newAlerts.push(newAlert)

          // Créer également une alerte de prix si les préférences le permettent
          if (preferences.notificationChannels.inApp) {
            await this.createPriceAlertFromSectorAlert(newAlert)
          }
        }

        // Vérifier si l'outlook sectoriel a changé
        if (previousData.sectorOutlook !== currentData.sectorOutlook) {
          const message = `La perspective pour le secteur ${this.getSectorName(sector)} est passée de ${this.getOutlookName(
            previousData.sectorOutlook,
          )} à ${this.getOutlookName(currentData.sectorOutlook)}`

          const newAlert = await this.createAlert({
            sector,
            indicatorName: "Perspective sectorielle",
            previousValue: this.getOutlookValue(previousData.sectorOutlook),
            newValue: this.getOutlookValue(currentData.sectorOutlook),
            changePercent: 0, // Non applicable pour un changement de perspective
            impact: currentData.sectorOutlook,
            importance: "high", // Un changement de perspective est toujours important
            message,
            userId,
          })

          newAlerts.push(newAlert)
        }
      } catch (error) {
        console.error(`Error checking sector indicators for ${sector}:`, error)
      }
    }

    return newAlerts
  }

  // Récupérer les préférences d'alertes sectorielles
  async getPreferences(userId?: string): Promise<SectorAlertPreferences> {
    if (typeof window === "undefined") {
      return this.getDefaultPreferences(userId)
    }

    const preferencesJson = localStorage.getItem(this.PREFERENCES_STORAGE_KEY)
    if (!preferencesJson) {
      return this.getDefaultPreferences(userId)
    }

    try {
      const allPreferences = JSON.parse(preferencesJson) as SectorAlertPreferences[]
      const userPreferences = userId
        ? allPreferences.find((p) => p.userId === userId)
        : allPreferences.find((p) => !p.userId)

      return userPreferences || this.getDefaultPreferences(userId)
    } catch (error) {
      console.error("Error parsing sector alert preferences:", error)
      return this.getDefaultPreferences(userId)
    }
  }

  // Mettre à jour les préférences d'alertes sectorielles
  async updatePreferences(preferences: SectorAlertPreferences): Promise<boolean> {
    if (typeof window === "undefined") {
      return false
    }

    const preferencesJson = localStorage.getItem(this.PREFERENCES_STORAGE_KEY)
    let allPreferences: SectorAlertPreferences[] = []

    if (preferencesJson) {
      try {
        allPreferences = JSON.parse(preferencesJson) as SectorAlertPreferences[]
      } catch (error) {
        console.error("Error parsing sector alert preferences:", error)
      }
    }

    // Trouver l'index des préférences existantes pour cet utilisateur
    const index = preferences.userId
      ? allPreferences.findIndex((p) => p.userId === preferences.userId)
      : allPreferences.findIndex((p) => !p.userId)

    if (index >= 0) {
      // Mettre à jour les préférences existantes
      allPreferences[index] = preferences
    } else {
      // Ajouter de nouvelles préférences
      allPreferences.push(preferences)
    }

    localStorage.setItem(this.PREFERENCES_STORAGE_KEY, JSON.stringify(allPreferences))
    return true
  }

  // Créer une alerte de prix à partir d'une alerte sectorielle
  private async createPriceAlertFromSectorAlert(sectorAlert: SectorAlert): Promise<void> {
    // Créer une alerte de prix pour informer l'utilisateur
    await alertsService.createPriceAlert({
      symbol: `SECTOR:${sectorAlert.sector}`,
      type: "custom",
      condition: "change",
      value: Math.abs(sectorAlert.changePercent),
      message: sectorAlert.message,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      userId: sectorAlert.userId,
    })
  }

  // Sauvegarder les alertes dans le localStorage
  private saveAlerts(alerts: SectorAlert[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(alerts))
    }
  }

  // Obtenir les préférences par défaut
  private getDefaultPreferences(userId?: string): SectorAlertPreferences {
    return {
      userId,
      enabledSectors: ["technology", "financial", "healthcare", "consumer", "energy"],
      minChangeThreshold: 5.0, // 5% de changement minimum
      minImportanceLevel: "medium",
      notificationChannels: {
        inApp: true,
        email: false,
        push: false,
      },
    }
  }

  // Obtenir le niveau d'importance basé sur la pertinence
  private getImportanceLevel(relevance: number): "high" | "medium" | "low" {
    if (relevance >= 0.8) return "high"
    if (relevance >= 0.5) return "medium"
    return "low"
  }

  // Obtenir la priorité numérique d'un niveau d'importance
  private getImportancePriority(level: "high" | "medium" | "low"): number {
    switch (level) {
      case "high":
        return 3
      case "medium":
        return 2
      case "low":
        return 1
      default:
        return 0
    }
  }

  // Obtenir le nom lisible d'un secteur
  private getSectorName(sector: SectorType): string {
    const sectorNames: Record<SectorType, string> = {
      technology: "Technologie",
      healthcare: "Santé",
      financial: "Finance",
      consumer: "Consommation",
      industrial: "Industrie",
      energy: "Énergie",
      utilities: "Services publics",
      materials: "Matériaux",
      communication: "Communication",
      real_estate: "Immobilier",
      unknown: "Inconnu",
    }

    return sectorNames[sector]
  }

  // Obtenir le nom lisible d'une perspective
  private getOutlookName(outlook: "bullish" | "bearish" | "neutral"): string {
    switch (outlook) {
      case "bullish":
        return "Haussière"
      case "bearish":
        return "Baissière"
      default:
        return "Neutre"
    }
  }

  // Obtenir une valeur numérique pour une perspective
  private getOutlookValue(outlook: "bullish" | "bearish" | "neutral"): number {
    switch (outlook) {
      case "bullish":
        return 1
      case "bearish":
        return -1
      default:
        return 0
    }
  }
}

// Exporter une instance du service
export const sectorAlertsService = new SectorAlertsService()
