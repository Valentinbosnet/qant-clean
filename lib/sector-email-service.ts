import { emailService, type EmailOptions } from "./email-service"
import { sectorAlertsService, type SectorAlert } from "./sector-alerts-service"
import type { SectorType } from "./sector-classification"
import { getConfig } from "./env-config"

// Interface pour les options d'email d'alerte sectorielle
interface SectorAlertEmailOptions {
  userId: string
  userEmail: string
  alerts: SectorAlert[]
  unsubscribeToken?: string
}

class SectorEmailService {
  // Limite d'emails par jour par utilisateur
  private readonly DAILY_EMAIL_LIMIT = 5
  private emailCounts: Record<string, number> = {}
  private lastResetDate: Date = new Date()

  constructor() {
    // Réinitialiser les compteurs d'emails chaque jour
    setInterval(() => this.resetEmailCountsIfNeeded(), 1000 * 60 * 60) // Vérifier toutes les heures
  }

  // Envoyer un email d'alerte sectorielle
  public async sendSectorAlertEmail(options: SectorAlertEmailOptions): Promise<boolean> {
    const { userId, userEmail, alerts, unsubscribeToken } = options

    // Vérifier si l'utilisateur a atteint la limite quotidienne d'emails
    if (this.hasReachedDailyLimit(userId)) {
      console.log(`User ${userId} has reached the daily email limit`)
      return false
    }

    // Vérifier si l'utilisateur a activé les notifications par email
    const preferences = await sectorAlertsService.getPreferences(userId)
    if (!preferences.notificationChannels.email) {
      console.log(`User ${userId} has disabled email notifications`)
      return false
    }

    // Générer le contenu HTML de l'email
    const html = this.generateSectorAlertEmailHtml(alerts, unsubscribeToken)

    // Configurer les options d'email
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: this.generateEmailSubject(alerts),
      html,
    }

    // Envoyer l'email
    const success = await emailService.sendEmail(emailOptions)

    // Incrémenter le compteur d'emails si l'envoi a réussi
    if (success) {
      this.incrementEmailCount(userId)
    }

    return success
  }

  // Envoyer un email de résumé quotidien des alertes sectorielles
  public async sendDailySummaryEmail(
    userId: string,
    userEmail: string,
    alerts: SectorAlert[],
    unsubscribeToken?: string,
  ): Promise<boolean> {
    // Vérifier si l'utilisateur a activé les notifications par email
    const preferences = await sectorAlertsService.getPreferences(userId)
    if (!preferences.notificationChannels.email) {
      console.log(`User ${userId} has disabled email notifications`)
      return false
    }

    // Générer le contenu HTML de l'email
    const html = this.generateDailySummaryEmailHtml(alerts, unsubscribeToken)

    // Configurer les options d'email
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: `Résumé quotidien des alertes sectorielles (${new Date().toLocaleDateString()})`,
      html,
    }

    // Envoyer l'email
    return await emailService.sendEmail(emailOptions)
  }

  // Envoyer un email de test d'alerte sectorielle
  public async sendTestSectorAlertEmail(userEmail: string): Promise<boolean> {
    // Créer des alertes de test
    const testAlerts: SectorAlert[] = [
      {
        id: "test-alert-1",
        sector: "technology",
        indicatorName: "Taux d'inflation",
        previousValue: 2.5,
        newValue: 3.2,
        changePercent: 28,
        impact: "negative",
        importance: "high",
        message: "Le taux d'inflation a augmenté de 28% (2.5 → 3.2)",
        created: new Date(),
        read: false,
      },
      {
        id: "test-alert-2",
        sector: "financial",
        indicatorName: "Taux directeur",
        previousValue: 1.0,
        newValue: 1.25,
        changePercent: 25,
        impact: "negative",
        importance: "high",
        message: "Le taux directeur a augmenté de 25% (1.0 → 1.25)",
        created: new Date(),
        read: false,
      },
    ]

    // Générer le contenu HTML de l'email
    const html = this.generateSectorAlertEmailHtml(testAlerts, "test-token")

    // Configurer les options d'email
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: "Test d'alerte sectorielle",
      html,
    }

    // Envoyer l'email
    return await emailService.sendEmail(emailOptions)
  }

  // Vérifier si l'utilisateur a atteint la limite quotidienne d'emails
  private hasReachedDailyLimit(userId: string): boolean {
    return (this.emailCounts[userId] || 0) >= this.DAILY_EMAIL_LIMIT
  }

  // Incrémenter le compteur d'emails pour un utilisateur
  private incrementEmailCount(userId: string): void {
    this.emailCounts[userId] = (this.emailCounts[userId] || 0) + 1
  }

  // Réinitialiser les compteurs d'emails si nécessaire
  private resetEmailCountsIfNeeded(): void {
    const now = new Date()
    const currentDay = now.getDate()
    const lastResetDay = this.lastResetDate.getDate()

    if (currentDay !== lastResetDay) {
      this.emailCounts = {}
      this.lastResetDate = now
      console.log("Email counts reset at", now)
    }
  }

  // Générer le sujet de l'email en fonction des alertes
  private generateEmailSubject(alerts: SectorAlert[]): string {
    if (alerts.length === 0) {
      return "Alertes sectorielles"
    }

    if (alerts.length === 1) {
      const alert = alerts[0]
      return `Alerte sectorielle: ${alert.indicatorName} pour le secteur ${this.getSectorName(alert.sector)}`
    }

    const highImportanceCount = alerts.filter((alert) => alert.importance === "high").length
    if (highImportanceCount > 0) {
      return `${highImportanceCount} alertes sectorielles importantes`
    }

    return `${alerts.length} nouvelles alertes sectorielles`
  }

  // Générer le contenu HTML de l'email d'alerte sectorielle
  private generateSectorAlertEmailHtml(alerts: SectorAlert[], unsubscribeToken?: string): string {
    const config = getConfig()
    const appUrl = config.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
    const unsubscribeUrl = unsubscribeToken
      ? `${appUrl}/api/alerts/sectors/unsubscribe?token=${unsubscribeToken}`
      : `${appUrl}/alerts/sectors`

    const alertsHtml = alerts
      .map(
        (alert) => `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid ${this.getImportanceColor(
          alert.importance,
        )}; background-color: #f9f9f9;">
          <h3 style="margin-top: 0; color: #333; display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${this.getImpactColor(
              alert.impact,
            )}; margin-right: 8px;"></span>
            ${alert.indicatorName} - ${this.getSectorName(alert.sector)}
          </h3>
          <p style="margin: 8px 0; color: #555;">${alert.message}</p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #777;">
            <span>Importance: ${this.getImportanceLabel(alert.importance)}</span>
            <span>Impact: ${this.getImpactLabel(alert.impact)}</span>
            <span>Date: ${alert.created.toLocaleString()}</span>
          </div>
        </div>
      `,
      )
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alertes Sectorielles</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${appUrl}/logo.png" alt="Logo" style="max-width: 150px;">
        </div>
        
        <div style="background-color: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-top: 0;">Alertes Sectorielles</h1>
          <p>Voici les dernières alertes concernant les indicateurs macroéconomiques sectoriels :</p>
          
          <div style="margin: 25px 0;">
            ${alertsHtml}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${appUrl}/alerts/sectors" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">
              Voir toutes les alertes
            </a>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
          <p>Vous recevez cet email car vous avez activé les notifications par email pour les alertes sectorielles.</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #777; text-decoration: underline;">
              Désactiver les notifications par email
            </a>
          </p>
          <p>&copy; ${new Date().getFullYear()} Stock Prediction App. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `
  }

  // Générer le contenu HTML de l'email de résumé quotidien
  private generateDailySummaryEmailHtml(alerts: SectorAlert[], unsubscribeToken?: string): string {
    const config = getConfig()
    const appUrl = config.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
    const unsubscribeUrl = unsubscribeToken
      ? `${appUrl}/api/alerts/sectors/unsubscribe?token=${unsubscribeToken}`
      : `${appUrl}/alerts/sectors`

    // Regrouper les alertes par secteur
    const alertsBySector: Record<SectorType, SectorAlert[]> = {} as Record<SectorType, SectorAlert[]>

    alerts.forEach((alert) => {
      if (!alertsBySector[alert.sector]) {
        alertsBySector[alert.sector] = []
      }
      alertsBySector[alert.sector].push(alert)
    })

    // Générer le HTML pour chaque secteur
    const sectorsHtml = Object.entries(alertsBySector)
      .map(([sector, sectorAlerts]) => {
        const alertsHtml = sectorAlerts
          .map(
            (alert) => `
            <li style="margin-bottom: 10px;">
              <strong>${alert.indicatorName}:</strong> ${alert.message}
              <span style="display: inline-block; margin-left: 5px; width: 8px; height: 8px; border-radius: 50%; background-color: ${this.getImpactColor(
                alert.impact,
              )};"></span>
            </li>
          `,
          )
          .join("")

        return `
          <div style="margin-bottom: 25px; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
            <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
              Secteur: ${this.getSectorName(sector as SectorType)}
            </h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              ${alertsHtml}
            </ul>
          </div>
        `
      })
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Résumé quotidien des alertes sectorielles</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${appUrl}/logo.png" alt="Logo" style="max-width: 150px;">
        </div>
        
        <div style="background-color: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-top: 0;">Résumé quotidien des alertes sectorielles</h1>
          <p>Voici un résumé des alertes sectorielles du ${new Date().toLocaleDateString()} :</p>
          
          <div style="margin: 25px 0;">
            ${sectorsHtml}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${appUrl}/alerts/sectors" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">
              Voir toutes les alertes
            </a>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
          <p>Vous recevez cet email car vous avez activé les notifications par email pour les alertes sectorielles.</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #777; text-decoration: underline;">
              Désactiver les notifications par email
            </a>
          </p>
          <p>&copy; ${new Date().getFullYear()} Stock Prediction App. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `
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

  // Obtenir la couleur correspondant à l'importance
  private getImportanceColor(importance: "high" | "medium" | "low"): string {
    switch (importance) {
      case "high":
        return "#e53935"
      case "medium":
        return "#fb8c00"
      case "low":
        return "#43a047"
      default:
        return "#757575"
    }
  }

  // Obtenir le libellé correspondant à l'importance
  private getImportanceLabel(importance: "high" | "medium" | "low"): string {
    switch (importance) {
      case "high":
        return "Haute"
      case "medium":
        return "Moyenne"
      case "low":
        return "Faible"
      default:
        return "Inconnue"
    }
  }

  // Obtenir la couleur correspondant à l'impact
  private getImpactColor(impact: "positive" | "negative" | "neutral"): string {
    switch (impact) {
      case "positive":
        return "#43a047"
      case "negative":
        return "#e53935"
      case "neutral":
        return "#757575"
      default:
        return "#757575"
    }
  }

  // Obtenir le libellé correspondant à l'impact
  private getImpactLabel(impact: "positive" | "negative" | "neutral"): string {
    switch (impact) {
      case "positive":
        return "Positif"
      case "negative":
        return "Négatif"
      case "neutral":
        return "Neutre"
      default:
        return "Inconnu"
    }
  }
}

// Exporter une instance du service
export const sectorEmailService = new SectorEmailService()
