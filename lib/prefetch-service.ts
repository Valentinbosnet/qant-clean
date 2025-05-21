// Define the CachePriority enum directly in this file
export enum CachePriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// Define offline settings interface
interface OfflineSettings {
  enabled: boolean
  autoDetect: boolean
  syncOnReconnect: boolean
  compressionEnabled: boolean
  storageQuota: number // in bytes
}

// Default offline settings
const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: false,
  autoDetect: true,
  syncOnReconnect: true,
  compressionEnabled: false,
  storageQuota: 50 * 1024 * 1024, // 50MB
}

// Implement the required offline functions
export function isOfflineMode(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    return localStorage.getItem("offlineMode") === "true"
  } catch (error) {
    console.error("Error checking offline mode:", error)
    return false
  }
}

export function getOfflineSettings(): OfflineSettings {
  if (typeof window === "undefined") {
    return DEFAULT_OFFLINE_SETTINGS
  }

  try {
    const settingsJson = localStorage.getItem("offlineSettings")
    if (!settingsJson) {
      return DEFAULT_OFFLINE_SETTINGS
    }

    return { ...DEFAULT_OFFLINE_SETTINGS, ...JSON.parse(settingsJson) }
  } catch (error) {
    console.error("Error getting offline settings:", error)
    return DEFAULT_OFFLINE_SETTINGS
  }
}

export function saveOfflineSettings(settings: Partial<OfflineSettings>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentSettings = getOfflineSettings()
    const newSettings = { ...currentSettings, ...settings }
    localStorage.setItem("offlineSettings", JSON.stringify(newSettings))
  } catch (error) {
    console.error("Error saving offline settings:", error)
  }
}

export function saveToOfflineCache(key: string, data: any, options: any = {}): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(`offlineCache_${key}`, JSON.stringify(data))
    localStorage.setItem(
      `offlineCacheMeta_${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        type: options.type || "json",
        priority: options.priority || CachePriority.MEDIUM,
        category: options.category || "general",
        tags: options.tags || [],
      }),
    )
  } catch (error) {
    console.error(`Error saving to offline cache (${key}):`, error)
  }
}

export function getFromOfflineCache<T = any>(key: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const data = localStorage.getItem(`offlineCache_${key}`)
    if (!data) {
      return null
    }

    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Error getting from offline cache (${key}):`, error)
    return null
  }
}

export function analyzeStorageUsage(): any {
  if (typeof window === "undefined") {
    return {
      totalItems: 0,
      totalSize: 0,
      usagePercentage: 0,
    }
  }

  try {
    let totalItems = 0
    let totalSize = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("offlineCache_")) {
        totalItems++
        const value = localStorage.getItem(key) || ""
        totalSize += new Blob([value]).size
      }
    }

    const settings = getOfflineSettings()
    const usagePercentage = settings.storageQuota > 0 ? (totalSize / settings.storageQuota) * 100 : 0

    return {
      totalItems,
      totalSize,
      usagePercentage,
    }
  } catch (error) {
    console.error("Error analyzing storage usage:", error)
    return {
      totalItems: 0,
      totalSize: 0,
      usagePercentage: 0,
    }
  }
}

export function syncOfflineData(): Promise<boolean> {
  return Promise.resolve(true) // Placeholder implementation
}

// Types pour le préchargement
export interface PrefetchConfig {
  enabled: boolean
  maxItemsPerSession: number
  maxSizePerSession: number // en octets
  minBatteryLevel: number // pourcentage minimum de batterie pour précharger
  onlyOnWifi: boolean
  prefetchOnLogin: boolean
  prefetchInterval: number // en millisecondes
  intelligentPrefetch: boolean // utiliser l'apprentissage des habitudes
  prefetchPriority: CachePriority
}

export interface NavigationPattern {
  fromRoute: string
  toRoute: string
  count: number
  lastVisited: number
}

export interface UserBehavior {
  frequentRoutes: Record<string, number> // route -> nombre de visites
  navigationPatterns: NavigationPattern[]
  routePredictions: Record<string, string[]> // route -> predicted routes
  lastUpdated: number
}

export interface PrefetchStats {
  totalPrefetched: number
  totalSize: number
  lastPrefetchTime: number
  successRate: number // taux de succès (données préchargées effectivement utilisées)
  prefetchedItems: string[]
}

// Clés pour le stockage local
const PREFETCH_CONFIG_KEY = "prefetchConfig"
const USER_BEHAVIOR_KEY = "userBehavior"
const PREFETCH_STATS_KEY = "prefetchStats"
const ROUTE_HISTORY_KEY = "routeHistory"
const OFFLINE_USER_DATA_KEY = "offlineUserData"

// Configuration par défaut
const DEFAULT_PREFETCH_CONFIG: PrefetchConfig = {
  enabled: true,
  maxItemsPerSession: 20,
  maxSizePerSession: 10 * 1024 * 1024, // 10MB
  minBatteryLevel: 20, // 20%
  onlyOnWifi: true,
  prefetchOnLogin: true,
  prefetchInterval: 30 * 60 * 1000, // 30 minutes
  intelligentPrefetch: true,
  prefetchPriority: CachePriority.LOW,
}

// Comportement utilisateur par défaut
const DEFAULT_USER_BEHAVIOR: UserBehavior = {
  frequentRoutes: {},
  navigationPatterns: [],
  routePredictions: {},
  lastUpdated: Date.now(),
}

// Statistiques de préchargement par défaut
const DEFAULT_PREFETCH_STATS: PrefetchStats = {
  totalPrefetched: 0,
  totalSize: 0,
  lastPrefetchTime: 0,
  successRate: 0,
  prefetchedItems: [],
}

/**
 * Récupère la configuration de préchargement
 * @returns {PrefetchConfig} Configuration de préchargement
 */
export function getPrefetchConfig(): PrefetchConfig {
  if (typeof window === "undefined") {
    return DEFAULT_PREFETCH_CONFIG
  }

  try {
    const configJson = localStorage.getItem(PREFETCH_CONFIG_KEY)
    if (!configJson) {
      return DEFAULT_PREFETCH_CONFIG
    }

    return { ...DEFAULT_PREFETCH_CONFIG, ...JSON.parse(configJson) }
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration de préchargement:", error)
    return DEFAULT_PREFETCH_CONFIG
  }
}

/**
 * Sauvegarde la configuration de préchargement
 * @param {Partial<PrefetchConfig>} config - Configuration à sauvegarder
 */
export function savePrefetchConfig(config: Partial<PrefetchConfig>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentConfig = getPrefetchConfig()
    const newConfig = { ...currentConfig, ...config }
    localStorage.setItem(PREFETCH_CONFIG_KEY, JSON.stringify(newConfig))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la configuration de préchargement:", error)
  }
}

/**
 * Récupère le comportement de l'utilisateur
 * @returns {UserBehavior} Comportement de l'utilisateur
 */
export function getUserBehavior(): UserBehavior {
  if (typeof window === "undefined") {
    return DEFAULT_USER_BEHAVIOR
  }

  try {
    const behaviorJson = localStorage.getItem(USER_BEHAVIOR_KEY)
    if (!behaviorJson) {
      return DEFAULT_USER_BEHAVIOR
    }

    return JSON.parse(behaviorJson)
  } catch (error) {
    console.error("Erreur lors de la récupération du comportement utilisateur:", error)
    return DEFAULT_USER_BEHAVIOR
  }
}

/**
 * Sauvegarde le comportement de l'utilisateur
 * @param {Partial<UserBehavior>} behavior - Comportement à sauvegarder
 */
export function saveUserBehavior(behavior: Partial<UserBehavior>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentBehavior = getUserBehavior()
    const newBehavior = { ...currentBehavior, ...behavior, lastUpdated: Date.now() }
    localStorage.setItem(USER_BEHAVIOR_KEY, JSON.stringify(newBehavior))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du comportement utilisateur:", error)
  }
}

/**
 * Récupère les statistiques de préchargement
 * @returns {PrefetchStats} Statistiques de préchargement
 */
export function getPrefetchStats(): PrefetchStats {
  if (typeof window === "undefined") {
    return DEFAULT_PREFETCH_STATS
  }

  try {
    const statsJson = localStorage.getItem(PREFETCH_STATS_KEY)
    if (!statsJson) {
      return DEFAULT_PREFETCH_STATS
    }

    return JSON.parse(statsJson)
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de préchargement:", error)
    return DEFAULT_PREFETCH_STATS
  }
}

/**
 * Sauvegarde les statistiques de préchargement
 * @param {Partial<PrefetchStats>} stats - Statistiques à sauvegarder
 */
export function savePrefetchStats(stats: Partial<PrefetchStats>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentStats = getPrefetchStats()
    const newStats = { ...currentStats, ...stats }
    localStorage.setItem(PREFETCH_STATS_KEY, JSON.stringify(newStats))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des statistiques de préchargement:", error)
  }
}

/**
 * Enregistre une visite de route pour l'analyse comportementale
 * @param {string} route - Route visitée
 */
export function trackRouteVisit(route: string): void {
  if (typeof window === "undefined" || !route) {
    return
  }

  try {
    const config = getPrefetchConfig()
    if (!config.enabled || !config.intelligentPrefetch) {
      return
    }

    // Récupérer l'historique des routes
    const routeHistoryJson = sessionStorage.getItem(ROUTE_HISTORY_KEY)
    const routeHistory = routeHistoryJson ? JSON.parse(routeHistoryJson) : []

    // Ajouter la route actuelle à l'historique
    const currentTime = Date.now()
    routeHistory.push({ route, timestamp: currentTime })

    // Limiter l'historique aux 100 dernières routes
    if (routeHistory.length > 100) {
      routeHistory.shift()
    }

    // Sauvegarder l'historique mis à jour
    sessionStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify(routeHistory))

    // Mettre à jour les statistiques de fréquentation
    const behavior = getUserBehavior()

    // Mettre à jour le compteur de fréquence
    behavior.frequentRoutes[route] = (behavior.frequentRoutes[route] || 0) + 1

    // Mettre à jour les modèles de navigation si nous avons une route précédente
    if (routeHistory.length >= 2) {
      const previousRoute = routeHistory[routeHistory.length - 2].route
      const existingPattern = behavior.navigationPatterns.find(
        (p) => p.fromRoute === previousRoute && p.toRoute === route,
      )

      if (existingPattern) {
        existingPattern.count++
        existingPattern.lastVisited = currentTime
      } else {
        behavior.navigationPatterns.push({
          fromRoute: previousRoute,
          toRoute: route,
          count: 1,
          lastVisited: currentTime,
        })
      }

      // Limiter le nombre de modèles de navigation
      if (behavior.navigationPatterns.length > 100) {
        // Trier par nombre de visites et supprimer les moins fréquents
        behavior.navigationPatterns.sort((a, b) => b.count - a.count)
        behavior.navigationPatterns = behavior.navigationPatterns.slice(0, 100)
      }
    }

    // Sauvegarder le comportement mis à jour
    saveUserBehavior(behavior)
  } catch (error) {
    console.error("Erreur lors du suivi de la visite de route:", error)
  }
}

/**
 * Prédit les routes que l'utilisateur est susceptible de visiter ensuite
 * @param {string} currentRoute - Route actuelle
 * @returns {string[]} Routes prédites
 */
export function predictNextRoutes(currentRoute: string): string[] {
  if (typeof window === "undefined" || !currentRoute) {
    return []
  }

  try {
    const behavior = getUserBehavior()
    return behavior.routePredictions[currentRoute] || []
  } catch (error) {
    console.error("Erreur lors de la prédiction des routes:", error)
    return []
  }
}

/**
 * Record a navigation event
 */
export function recordNavigation(fromRoute: string, toRoute: string): void {
  if (typeof window === "undefined" || !fromRoute || !toRoute) {
    return
  }

  try {
    const behavior = getUserBehavior()
    const existingPattern = behavior.navigationPatterns.find((p) => p.fromRoute === fromRoute && p.toRoute === toRoute)

    if (existingPattern) {
      existingPattern.count++
      existingPattern.lastVisited = Date.now()
    } else {
      behavior.navigationPatterns.push({
        fromRoute,
        toRoute,
        count: 1,
        lastVisited: Date.now(),
      })
    }

    // Update route predictions
    if (!behavior.routePredictions[fromRoute]) {
      behavior.routePredictions[fromRoute] = []
    }
    if (!behavior.routePredictions[fromRoute].includes(toRoute)) {
      behavior.routePredictions[fromRoute].push(toRoute)
    }

    saveUserBehavior(behavior)
    console.log(`Navigation recorded: ${fromRoute} -> ${toRoute}`)
  } catch (error) {
    console.error("Error recording navigation:", error)
  }
}

/**
 * Clear all navigation data
 */
export function clearNavigationData(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const behavior = getUserBehavior()
    behavior.navigationPatterns = []
    behavior.routePredictions = {}
    saveUserBehavior(behavior)
    console.log("Navigation data cleared")
  } catch (error) {
    console.error("Error clearing navigation data:", error)
  }
}

/**
 * Get prefetch settings
 */
export function getPrefetchSettings() {
  return {
    enabled: true,
    maxPrefetchCount: 3,
    prefetchThreshold: 0.2,
    prefetchOnHover: true,
  }
}

/**
 * Update prefetch settings
 */
export function updatePrefetchSettings(settings: any): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    console.log("Prefetch settings updated", settings)
    // In a real app, this would update the settings
  } catch (error) {
    console.error("Error updating prefetch settings:", error)
  }
}

/**
 * Vérifie si les conditions sont réunies pour effectuer un préchargement
 * @returns {boolean} True si le préchargement est possible
 */
export async function canPrefetch(): Promise<boolean> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }

  try {
    const config = getPrefetchConfig()

    // Vérifier si le préchargement est activé
    if (!config.enabled) {
      return false
    }

    // Vérifier si nous sommes en ligne
    if (!navigator.onLine) {
      return false
    }

    // Vérifier si nous sommes sur WiFi si requis
    if (config.onlyOnWifi) {
      // La détection du type de connexion n'est pas toujours disponible
      // Utiliser l'API NetworkInformation si disponible
      const connection = (navigator as any).connection
      if (connection && connection.type && connection.type !== "wifi") {
        return false
      }
    }

    // Vérifier le niveau de batterie si l'API est disponible
    if ("getBattery" in navigator) {
      const battery = await (navigator as any).getBattery()
      if (battery.level * 100 < config.minBatteryLevel) {
        return false
      }
    }

    // Vérifier l'espace disponible
    const storageUsage = analyzeStorageUsage()
    const offlineSettings = getOfflineSettings()
    if (offlineSettings.storageQuota > 0 && storageUsage.usagePercentage > 80) {
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la vérification des conditions de préchargement:", error)
    return false
  }
}

/**
 * Précharge les données pour une route spécifique
 * @param {string} route - Route à précharger
 * @param {Function} fetchData - Fonction pour récupérer les données
 * @returns {Promise<boolean>} True si le préchargement a réussi
 */
export async function prefetchRouteData(
  route: string,
  fetchData: () => Promise<{ key: string; data: any; type?: string; category?: string; tags?: string[] }[]>,
): Promise<boolean> {
  if (typeof window === "undefined" || !route) {
    return false
  }

  try {
    // Vérifier si nous pouvons précharger
    const canPrefetchNow = await canPrefetch()
    if (!canPrefetchNow) {
      return false
    }

    const config = getPrefetchConfig()
    const stats = getPrefetchStats()

    // Récupérer les données
    const dataItems = await fetchData()

    // Limiter le nombre d'éléments préchargés
    const itemsToCache = dataItems.slice(0, config.maxItemsPerSession)

    let totalSize = 0
    const prefetchedItems: string[] = []

    // Mettre en cache chaque élément
    for (const item of itemsToCache) {
      // Estimer la taille des données
      const jsonData = JSON.stringify(item.data)
      const itemSize = new Blob([jsonData]).size

      // Vérifier si nous dépassons la taille maximale
      if (totalSize + itemSize > config.maxSizePerSession) {
        break
      }

      // Mettre en cache les données
      saveToOfflineCache(item.key, item.data, {
        type: item.type || "json",
        priority: config.prefetchPriority,
        category: item.category || "prefetched",
        tags: [...(item.tags || []), "prefetched", `route:${route}`],
      })

      totalSize += itemSize
      prefetchedItems.push(item.key)
    }

    // Mettre à jour les statistiques
    savePrefetchStats({
      totalPrefetched: stats.totalPrefetched + prefetchedItems.length,
      totalSize: stats.totalSize + totalSize,
      lastPrefetchTime: Date.now(),
      prefetchedItems: [...stats.prefetchedItems, ...prefetchedItems],
    })

    console.log(`Préchargement réussi pour la route ${route}: ${prefetchedItems.length} éléments, ${totalSize} octets`)
    return true
  } catch (error) {
    console.error(`Erreur lors du préchargement des données pour la route ${route}:`, error)
    return false
  }
}

/**
 * Précharge les données pour les routes prédites
 * @param {string} currentRoute - Route actuelle
 * @param {Record<string, () => Promise<any[]>>} routeDataFetchers - Fonctions de récupération de données par route
 * @returns {Promise<number>} Nombre de routes préchargées
 */
export async function prefetchPredictedRoutes(
  currentRoute: string,
  routeDataFetchers: Record<
    string,
    () => Promise<{ key: string; data: any; type?: string; category?: string; tags?: string[] }[]>
  >,
): Promise<number> {
  if (typeof window === "undefined" || !currentRoute) {
    return 0
  }

  try {
    // Vérifier si nous pouvons précharger
    const canPrefetchNow = await canPrefetch()
    if (!canPrefetchNow) {
      return 0
    }

    // Prédire les routes suivantes
    const predictedRoutes = predictNextRoutes(currentRoute)
    let prefetchedCount = 0

    // Précharger les données pour chaque route prédite
    for (const route of predictedRoutes) {
      // Vérifier si nous avons un fetcher pour cette route
      if (routeDataFetchers[route]) {
        const success = await prefetchRouteData(route, routeDataFetchers[route])
        if (success) {
          prefetchedCount++
        }
      }
    }

    return prefetchedCount
  } catch (error) {
    console.error("Erreur lors du préchargement des routes prédites:", error)
    return 0
  }
}

/**
 * Marque un élément préchargé comme utilisé pour améliorer les statistiques
 * @param {string} key - Clé de l'élément
 */
export function markPrefetchedItemAsUsed(key: string): void {
  if (typeof window === "undefined" || !key) {
    return
  }

  try {
    const stats = getPrefetchStats()
    if (stats.prefetchedItems.includes(key)) {
      // Calculer le nouveau taux de succès
      const usedItems = stats.successRate * stats.totalPrefetched + 1
      const newSuccessRate = usedItems / stats.totalPrefetched

      // Mettre à jour les statistiques
      savePrefetchStats({
        successRate: newSuccessRate,
      })
    }
  } catch (error) {
    console.error(`Erreur lors du marquage de l'élément préchargé ${key} comme utilisé:`, error)
  }
}

/**
 * Initialise le service de préchargement
 */
export function initPrefetchService(): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  // Configurer le préchargement périodique
  const config = getPrefetchConfig()
  const intervalId = setInterval(async () => {
    // Vérifier si nous pouvons précharger
    const canPrefetchNow = await canPrefetch()
    if (canPrefetchNow) {
      // Le préchargement effectif sera déclenché par les composants
      console.log("Intervalle de préchargement déclenché, prêt pour le préchargement")
    }
  }, config.prefetchInterval)

  // Retourner une fonction pour nettoyer
  return () => {
    clearInterval(intervalId)
  }
}

/**
 * Nettoie les éléments préchargés non utilisés
 * @returns {number} Nombre d'éléments supprimés
 */
export function cleanupUnusedPrefetchedItems(): number {
  if (typeof window === "undefined") {
    return 0
  }

  try {
    const stats = getPrefetchStats()
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

    // Si le dernier préchargement est récent, ne rien faire
    if (stats.lastPrefetchTime > twoWeeksAgo) {
      return 0
    }

    // Supprimer les éléments préchargés qui n'ont pas été utilisés
    let removedCount = 0
    for (const key of stats.prefetchedItems) {
      const data = getFromOfflineCache(key)
      if (data) {
        // Si les données existent encore, les supprimer
        localStorage.removeItem(`offlineCache_${key}`)
        localStorage.removeItem(`offlineCacheMeta_${key}`)
        removedCount++
      }
    }

    // Réinitialiser les statistiques
    savePrefetchStats({
      prefetchedItems: [],
    })

    return removedCount
  } catch (error) {
    console.error("Erreur lors du nettoyage des éléments préchargés non utilisés:", error)
    return 0
  }
}

/**
 * Authenticates a user in offline mode
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: any, error?: string}>} Authentication result
 */
export async function authenticateOfflineUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: any; error?: string }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Cannot authenticate offline on server" }
  }

  try {
    // Check if we have stored user credentials
    const storedUserData = localStorage.getItem(OFFLINE_USER_DATA_KEY)

    if (!storedUserData) {
      return {
        success: false,
        error: "No offline user data available. You need to log in at least once while online.",
      }
    }

    const userData = JSON.parse(storedUserData)

    // Simple check - in a real app, you'd use a proper hash comparison
    // This is just a basic implementation for demonstration
    if (userData.email === email && userData.passwordHash === hashPassword(password)) {
      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          // Don't include sensitive data like password hash
        },
      }
    }

    return { success: false, error: "Invalid email or password" }
  } catch (error) {
    console.error("Error during offline authentication:", error)
    return { success: false, error: "Authentication failed" }
  }
}

/**
 * Stores user data for offline authentication
 * @param {any} user - User data to store
 * @param {string} passwordHash - Hashed password
 */
export function storeOfflineUserData(user: any, passwordHash: string): void {
  if (typeof window === "undefined" || !user) {
    return
  }

  try {
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash,
      storedAt: Date.now(),
    }

    localStorage.setItem(OFFLINE_USER_DATA_KEY, JSON.stringify(userData))
  } catch (error) {
    console.error("Error storing offline user data:", error)
  }
}

/**
 * Simple password hashing function
 * Note: In a real application, use a proper crypto library
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
 */
function hashPassword(password: string): string {
  // This is NOT secure - just for demonstration
  // In a real app, use a proper hashing library
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

/**
 * Checks if offline authentication is available
 * @returns {boolean} True if offline authentication is available
 */
export function isOfflineAuthAvailable(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    return localStorage.getItem(OFFLINE_USER_DATA_KEY) !== null
  } catch (error) {
    console.error("Error checking offline auth availability:", error)
    return false
  }
}

/**
 * Clears offline authentication data
 */
export function clearOfflineAuthData(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(OFFLINE_USER_DATA_KEY)
  } catch (error) {
    console.error("Error clearing offline auth data:", error)
  }
}
