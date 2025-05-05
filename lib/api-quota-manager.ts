// Gestionnaire de quota d'API pour éviter de dépasser les limites
export class ApiQuotaManager {
  private static instance: ApiQuotaManager
  private requestTimestamps: number[] = []
  private dailyRequestCount = 0
  private lastDayReset = new Date().setHours(0, 0, 0, 0)

  // Limites de l'API Alpha Vantage gratuite
  private readonly REQUESTS_PER_MINUTE = 6
  private readonly REQUESTS_PER_DAY = 500

  private constructor() {
    // Initialiser le gestionnaire
    console.log("[API Quota] Gestionnaire de quota initialisé")
  }

  public static getInstance(): ApiQuotaManager {
    if (!ApiQuotaManager.instance) {
      ApiQuotaManager.instance = new ApiQuotaManager()
    }
    return ApiQuotaManager.instance
  }

  // Vérifier si on peut faire une requête
  public canMakeRequest(): boolean {
    // Réinitialiser le compteur quotidien si nécessaire
    const today = new Date().setHours(0, 0, 0, 0)
    if (today > this.lastDayReset) {
      this.dailyRequestCount = 0
      this.lastDayReset = today
      console.log("[API Quota] Compteur quotidien réinitialisé")
    }

    // Vérifier le quota quotidien
    if (this.dailyRequestCount >= this.REQUESTS_PER_DAY) {
      console.log("[API Quota] Quota quotidien dépassé")
      return false
    }

    // Nettoyer les timestamps plus anciens que 1 minute
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < 60000)

    // Vérifier le quota par minute
    const minuteRequests = this.requestTimestamps.length
    const canMakeRequest = minuteRequests < this.REQUESTS_PER_MINUTE

    if (!canMakeRequest) {
      console.log(`[API Quota] Limite par minute atteinte (${minuteRequests}/${this.REQUESTS_PER_MINUTE})`)
    }

    return canMakeRequest
  }

  // Enregistrer une nouvelle requête
  public recordRequest(): void {
    this.requestTimestamps.push(Date.now())
    this.dailyRequestCount++
    console.log(
      `[API Quota] Requête enregistrée. Minute: ${this.requestTimestamps.length}/${this.REQUESTS_PER_MINUTE}, Jour: ${this.dailyRequestCount}/${this.REQUESTS_PER_DAY}`,
    )
  }

  // Réserver plusieurs requêtes à l'avance
  public reserveRequests(count: number): boolean {
    // Vérifier si nous avons assez de quota disponible
    if (this.getAvailableRequestsPerMinute() < count) {
      console.log(`[API Quota] Impossible de réserver ${count} requêtes, quota insuffisant`)
      return false
    }

    // Réserver les requêtes
    const now = Date.now()
    for (let i = 0; i < count; i++) {
      this.requestTimestamps.push(now)
    }
    this.dailyRequestCount += count

    console.log(
      `[API Quota] ${count} requêtes réservées. Minute: ${this.requestTimestamps.length}/${this.REQUESTS_PER_MINUTE}, Jour: ${this.dailyRequestCount}/${this.REQUESTS_PER_DAY}`,
    )
    return true
  }

  // Obtenir le nombre de requêtes disponibles par minute
  public getAvailableRequestsPerMinute(): number {
    // Nettoyer les timestamps plus anciens que 1 minute
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < 60000)

    return Math.max(0, this.REQUESTS_PER_MINUTE - this.requestTimestamps.length)
  }

  // Obtenir les informations de quota restant
  public getQuotaInfo(): {
    requestsThisMinute: number
    minuteLimit: number
    requestsToday: number
    dailyLimit: number
    canMakeRequest: boolean
    minuteResetTime: Date
    availableRequestsPerMinute: number
  } {
    const now = Date.now()
    // Nettoyer les timestamps plus anciens que 1 minute
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < 60000)

    // Calculer le temps restant pour la réinitialisation de la minute
    const oldestTimestamp = this.requestTimestamps.length > 0 ? Math.min(...this.requestTimestamps) : now
    const minuteResetTime = new Date(oldestTimestamp + 60000)

    return {
      requestsThisMinute: this.requestTimestamps.length,
      minuteLimit: this.REQUESTS_PER_MINUTE,
      requestsToday: this.dailyRequestCount,
      dailyLimit: this.REQUESTS_PER_DAY,
      canMakeRequest: this.canMakeRequest(),
      minuteResetTime,
      availableRequestsPerMinute: this.getAvailableRequestsPerMinute(),
    }
  }
}

// Exporter une instance pour utilisation dans l'application
export const apiQuota = ApiQuotaManager.getInstance()
