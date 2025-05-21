import { compressJSON, decompressJSON } from "./compression-utils"

// Types pour le mode hors ligne
export interface OfflineUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata: {
    [key: string]: any
  }
  created_at: string
}

// Niveaux de priorité pour les données en cache
export enum CachePriority {
  CRITICAL = "critical", // Données essentielles (jamais supprimées automatiquement)
  HIGH = "high", // Données importantes (supprimées en dernier)
  MEDIUM = "medium", // Priorité normale (par défaut)
  LOW = "low", // Faible priorité (supprimées en premier)
  TEMPORARY = "temporary", // Données temporaires (supprimées rapidement)
}

// Règles de conservation par priorité (en millisecondes)
export const PRIORITY_RETENTION: Record<CachePriority, number> = {
  [CachePriority.CRITICAL]: Number.POSITIVE_INFINITY, // Jamais supprimé automatiquement
  [CachePriority.HIGH]: 30 * 24 * 60 * 60 * 1000, // 30 jours
  [CachePriority.MEDIUM]: 7 * 24 * 60 * 60 * 1000, // 7 jours
  [CachePriority.LOW]: 3 * 24 * 60 * 60 * 1000, // 3 jours
  [CachePriority.TEMPORARY]: 24 * 60 * 60 * 1000, // 1 jour
}

// Métadonnées pour un élément en cache
export interface CacheItemMetadata {
  key: string
  type: string
  originalSize: number
  compressedSize: number
  priority: CachePriority
  category?: string
  tags?: string[]
  accessCount: number
  lastAccessed: number
  timestamp: number
  expiry: number
}

export interface OfflineSettings {
  enabled: boolean
  autoDetect: boolean
  syncOnReconnect: boolean
  cacheExpiration: number // en millisecondes
  lastSyncTimestamp: number
  compressionEnabled: boolean
  compressionThreshold: number // taille minimale en octets pour appliquer la compression
  storageQuota: number // quota maximum en octets (0 = illimité)
  priorityRules: PriorityRule[] // règles pour déterminer automatiquement les priorités
  autoCleanupEnabled: boolean // nettoyage automatique périodique
  autoCleanupInterval: number // intervalle de nettoyage en millisecondes
}

// Règle pour déterminer automatiquement la priorité
export interface PriorityRule {
  id: string
  pattern: string // motif pour la clé (peut contenir des wildcards *)
  type?: string // type de données
  category?: string // catégorie de données
  tags?: string[] // tags associés
  priority: CachePriority // priorité à appliquer
  enabled: boolean
}

// Statistiques du cache
export interface CacheStats {
  totalItems: number
  totalSize: number
  compressedSize: number
  compressionRatio: number
  oldestItem: Date | null
  newestItem: Date | null
  expiringItems: number
  itemsByType: Record<string, number>
  itemsByPriority: Record<CachePriority, number>
  sizeByPriority: Record<CachePriority, number>
  accessFrequency: Record<string, number> // nombre d'accès par clé
}

// Interface pour l'analyse du stockage
export interface StorageAnalysis {
  totalSize: number
  usagePercentage: number
  itemCount: number
  lastUpdated: number
  itemsByCategory: Record<string, number>
  sizeByCategory: Record<string, number>
  quota: number
  available: number
}

// Clés pour le stockage local
const OFFLINE_MODE_KEY = "offlineMode"
const OFFLINE_USER_KEY = "offlineUser"
const OFFLINE_SETTINGS_KEY = "offlineSettings"
const OFFLINE_QUEUE_KEY = "offlineQueue"
const OFFLINE_CACHE_PREFIX = "offlineCache_"
const OFFLINE_CACHE_META_PREFIX = "offlineCacheMeta_"
const OFFLINE_PRIORITY_RULES_KEY = "offlinePriorityRules"

// Règles de priorité par défaut
const DEFAULT_PRIORITY_RULES: PriorityRule[] = [
  {
    id: "user-data",
    pattern: "user_*",
    priority: CachePriority.CRITICAL,
    enabled: true,
  },
  {
    id: "auth-data",
    pattern: "auth_*",
    priority: CachePriority.CRITICAL,
    enabled: true,
  },
  {
    id: "favorites",
    pattern: "*favorites*",
    priority: CachePriority.HIGH,
    enabled: true,
  },
  {
    id: "settings",
    pattern: "*settings*",
    priority: CachePriority.HIGH,
    enabled: true,
  },
  {
    id: "frequently-accessed",
    pattern: "*",
    priority: CachePriority.HIGH,
    enabled: true,
    // Cette règle sera appliquée dynamiquement en fonction du nombre d'accès
  },
  {
    id: "images",
    type: "image",
    priority: CachePriority.MEDIUM,
    enabled: true,
  },
  {
    id: "temporary-data",
    pattern: "temp_*",
    priority: CachePriority.TEMPORARY,
    enabled: true,
  },
]

// Paramètres par défaut pour le mode hors ligne
const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: false,
  autoDetect: true,
  syncOnReconnect: true,
  cacheExpiration: 7 * 24 * 60 * 60 * 1000, // 7 jours
  lastSyncTimestamp: 0,
  compressionEnabled: true,
  compressionThreshold: 1024, // 1KB
  storageQuota: 50 * 1024 * 1024, // 50MB
  priorityRules: DEFAULT_PRIORITY_RULES,
  autoCleanupEnabled: true,
  autoCleanupInterval: 24 * 60 * 60 * 1000, // 1 jour
}

/**
 * Vérifie si le mode hors ligne est activé
 * @returns {boolean} True si le mode hors ligne est activé, false sinon
 */
export function isOfflineMode(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // Vérifier si le mode hors ligne est explicitement activé
  const settings = getOfflineSettings()

  // Si le mode est explicitement activé
  if (settings.enabled) {
    return true
  }

  // Si la détection automatique est activée, vérifier la connectivité
  if (settings.autoDetect && typeof navigator !== "undefined") {
    return !navigator.onLine
  }

  return false
}

/**
 * Récupère les paramètres du mode hors ligne
 * @returns {OfflineSettings} Les paramètres du mode hors ligne
 */
export function getOfflineSettings(): OfflineSettings {
  if (typeof window === "undefined") {
    return DEFAULT_OFFLINE_SETTINGS
  }

  try {
    const settingsJson = localStorage.getItem(OFFLINE_SETTINGS_KEY)
    if (!settingsJson) {
      return DEFAULT_OFFLINE_SETTINGS
    }

    return { ...DEFAULT_OFFLINE_SETTINGS, ...JSON.parse(settingsJson) }
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres du mode hors ligne:", error)
    return DEFAULT_OFFLINE_SETTINGS
  }
}

/**
 * Sauvegarde les paramètres du mode hors ligne
 * @param {Partial<OfflineSettings>} settings - Les paramètres à sauvegarder
 */
export function saveOfflineSettings(settings: Partial<OfflineSettings>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentSettings = getOfflineSettings()
    const newSettings = { ...currentSettings, ...settings }
    localStorage.setItem(OFFLINE_SETTINGS_KEY, JSON.stringify(newSettings))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres du mode hors ligne:", error)
  }
}

/**
 * Active ou désactive le mode hors ligne
 * @param {boolean} enabled - True pour activer le mode hors ligne, false pour le désactiver
 * @returns {Promise<void>}
 */
export async function toggleOfflineMode(enabled: boolean): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  saveOfflineSettings({ enabled })

  // Si le mode hors ligne est désactivé, synchroniser les données
  if (!enabled && getOfflineSettings().syncOnReconnect) {
    await syncOfflineData()
  }
}

/**
 * Authentifie un utilisateur en mode hors ligne
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<OfflineUser | null>} L'utilisateur hors ligne ou null si l'authentification échoue
 */
export async function authenticateOfflineUser(email: string, password: string): Promise<OfflineUser | null> {
  if (typeof window === "undefined") {
    return null
  }

  // Vérifier si un utilisateur est déjà stocké
  const existingUser = getOfflineUser()

  // Si un utilisateur existe et que l'email correspond, le retourner
  if (existingUser && existingUser.email.toLowerCase() === email.toLowerCase()) {
    return existingUser
  }

  // Sinon, créer un nouvel utilisateur
  const offlineUser: OfflineUser = {
    id: `offline-${Date.now()}`,
    email: email || "utilisateur@hors-ligne.com",
    user_metadata: {
      full_name: "Utilisateur Hors Ligne",
    },
    app_metadata: {},
    created_at: new Date().toISOString(),
  }

  // Stocker l'utilisateur dans le stockage local
  localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineUser))

  return offlineUser
}

/**
 * Récupère l'utilisateur hors ligne
 * @returns {OfflineUser | null} L'utilisateur hors ligne ou null s'il n'existe pas
 */
export function getOfflineUser(): OfflineUser | null {
  if (typeof window === "undefined") {
    return null
  }

  const userJson = localStorage.getItem(OFFLINE_USER_KEY)

  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson) as OfflineUser
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur hors ligne:", error)
    return null
  }
}

/**
 * Déconnecte l'utilisateur hors ligne
 * @returns {Promise<void>}
 */
export async function signOutOfflineUser(): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(OFFLINE_USER_KEY)
}

/**
 * Détermine la priorité d'une clé de cache en fonction des règles
 * @param {string} key - Clé du cache
 * @param {string} type - Type de données
 * @param {string} [category] - Catégorie de données
 * @param {string[]} [tags] - Tags associés
 * @returns {CachePriority} Priorité déterminée
 */
export function determinePriority(key: string, type: string, category?: string, tags?: string[]): CachePriority {
  const settings = getOfflineSettings()
  const rules = settings.priorityRules.filter((rule) => rule.enabled)

  // Vérifier si la clé correspond à une règle de priorité
  for (const rule of rules) {
    // Vérifier le motif de la clé (avec support des wildcards)
    if (rule.pattern && matchPattern(key, rule.pattern)) {
      return rule.priority
    }

    // Vérifier le type
    if (rule.type && rule.type === type) {
      return rule.priority
    }

    // Vérifier la catégorie
    if (rule.category && category && rule.category === category) {
      return rule.priority
    }

    // Vérifier les tags
    if (rule.tags && tags && rule.tags.some((tag) => tags.includes(tag))) {
      return rule.priority
    }
  }

  // Si aucune règle ne correspond, utiliser la priorité moyenne par défaut
  return CachePriority.MEDIUM
}

/**
 * Vérifie si une chaîne correspond à un motif (avec support des wildcards *)
 * @param {string} str - Chaîne à vérifier
 * @param {string} pattern - Motif avec wildcards
 * @returns {boolean} True si la chaîne correspond au motif
 */
function matchPattern(str: string, pattern: string): boolean {
  // Échapper les caractères spéciaux de regex, sauf *
  const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(str)
}

/**
 * Sauvegarde des métadonnées pour un élément du cache
 * @param {string} key - Clé de l'élément
 * @param {string} type - Type de données (json, image, etc.)
 * @param {number} originalSize - Taille originale en octets
 * @param {number} compressedSize - Taille compressée en octets
 * @param {CachePriority} priority - Priorité de l'élément
 * @param {string} [category] - Catégorie de données
 * @param {string[]} [tags] - Tags associés
 */
function saveCacheMetadata(
  key: string,
  type: string,
  originalSize: number,
  compressedSize: number,
  priority: CachePriority,
  category?: string,
  tags?: string[],
): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    // Récupérer les métadonnées existantes pour conserver le compteur d'accès
    const existingMeta = getCacheMetadata(key)
    const accessCount = existingMeta ? existingMeta.accessCount + 1 : 1

    const settings = getOfflineSettings()

    // Déterminer la date d'expiration en fonction de la priorité
    let expiryTime = Date.now() + settings.cacheExpiration

    if (priority in PRIORITY_RETENTION) {
      if (PRIORITY_RETENTION[priority] === Number.POSITIVE_INFINITY) {
        // Pour les éléments critiques, utiliser une date très lointaine
        expiryTime = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000 // 10 ans
      } else {
        expiryTime = Date.now() + PRIORITY_RETENTION[priority]
      }
    }

    const metadata: CacheItemMetadata = {
      key,
      type,
      originalSize,
      compressedSize,
      priority,
      category,
      tags,
      accessCount,
      lastAccessed: Date.now(),
      timestamp: Date.now(),
      expiry: expiryTime,
    }

    localStorage.setItem(`${OFFLINE_CACHE_META_PREFIX}${key}`, JSON.stringify(metadata))
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des métadonnées pour ${key}:`, error)
  }
}

/**
 * Récupère les métadonnées d'un élément du cache
 * @param {string} key - Clé de l'élément
 * @returns {CacheItemMetadata | null} Les métadonnées ou null si elles n'existent pas
 */
function getCacheMetadata(key: string): CacheItemMetadata | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const metaJson = localStorage.getItem(`${OFFLINE_CACHE_META_PREFIX}${key}`)

    if (!metaJson) {
      return null
    }

    return JSON.parse(metaJson) as CacheItemMetadata
  } catch (error) {
    console.error(`Erreur lors de la récupération des métadonnées pour ${key}:`, error)
    return null
  }
}

/**
 * Met à jour le compteur d'accès pour un élément du cache
 * @param {string} key - Clé de l'élément
 */
function updateAccessCount(key: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const metadata = getCacheMetadata(key)
    if (metadata) {
      metadata.accessCount += 1
      metadata.lastAccessed = Date.now()

      // Mettre à jour dynamiquement la priorité en fonction de la fréquence d'accès
      if (metadata.accessCount > 20 && metadata.priority !== CachePriority.CRITICAL) {
        metadata.priority = CachePriority.HIGH
      }

      localStorage.setItem(`${OFFLINE_CACHE_META_PREFIX}${key}`, JSON.stringify(metadata))
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du compteur d'accès pour ${key}:`, error)
  }
}

/**
 * Sauvegarde des données dans le cache hors ligne avec compression et priorité
 * @param {string} key - Clé pour identifier les données
 * @param {any} data - Données à sauvegarder
 * @param {Object} options - Options supplémentaires
 * @param {number} [options.expiration] - Durée de validité du cache en millisecondes
 * @param {string} [options.type] - Type de données (pour les statistiques)
 * @param {CachePriority} [options.priority] - Priorité de l'élément
 * @param {string} [options.category] - Catégorie de données
 * @param {string[]} [options.tags] - Tags associés
 */
export function saveToOfflineCache(
  key: string,
  data: any,
  options: {
    expiration?: number
    type?: string
    priority?: CachePriority
    category?: string
    tags?: string[]
  } = {},
): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const settings = getOfflineSettings()
    const dataType = options.type || "json"

    // Déterminer la priorité
    const priority = options.priority || determinePriority(key, dataType, options.category, options.tags)

    // Vérifier l'espace disponible avant de sauvegarder
    if (settings.storageQuota > 0) {
      const stats = getCacheStats()
      if (stats.totalSize >= settings.storageQuota) {
        // Nettoyer le cache si on dépasse le quota
        cleanupOfflineCache(true)
      }
    }

    // Préparer les données à stocker
    const jsonData = JSON.stringify(data)
    const originalSize = new Blob([jsonData]).size

    // Déterminer si on doit compresser
    let storedData: string
    let compressedSize: number

    if (settings.compressionEnabled && originalSize > settings.compressionThreshold) {
      // Compresser les données
      storedData = compressJSON(data)
      compressedSize = new Blob([storedData]).size
    } else {
      // Stocker sans compression
      storedData = jsonData
      compressedSize = originalSize
    }

    const cacheItem = {
      data: storedData,
      compressed: settings.compressionEnabled && originalSize > settings.compressionThreshold,
      timestamp: Date.now(),
      expiry: Date.now() + (options.expiration || PRIORITY_RETENTION[priority] || settings.cacheExpiration),
    }

    localStorage.setItem(`${OFFLINE_CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))

    // Sauvegarder les métadonnées
    saveCacheMetadata(key, dataType, originalSize, compressedSize, priority, options.category, options.tags)
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde dans le cache hors ligne pour ${key}:`, error)

    // Si le stockage est plein, nettoyer les anciens éléments
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      cleanupOfflineCache(true)

      // Réessayer après nettoyage
      try {
        const settings = getOfflineSettings()
        const jsonData = JSON.stringify(data)

        // Stocker sans compression en cas d'urgence
        const cacheItem = {
          data: jsonData,
          compressed: false,
          timestamp: Date.now(),
          expiry: Date.now() + (options.expiration || settings.cacheExpiration),
        }

        localStorage.setItem(`${OFFLINE_CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))

        // Sauvegarder les métadonnées minimales
        const priority = options.priority || CachePriority.MEDIUM
        saveCacheMetadata(key, options.type || "json", jsonData.length, jsonData.length, priority)
      } catch (retryError) {
        console.error(`Échec de la sauvegarde même après nettoyage pour ${key}:`, retryError)
      }
    }
  }
}

/**
 * Récupère des données du cache hors ligne avec décompression automatique
 * @param {string} key - Clé pour identifier les données
 * @returns {any | null} Les données ou null si elles n'existent pas ou sont expirées
 */
export function getFromOfflineCache<T = any>(key: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const cacheJson = localStorage.getItem(`${OFFLINE_CACHE_PREFIX}${key}`)

    if (!cacheJson) {
      return null
    }

    const cacheItem = JSON.parse(cacheJson)

    // Vérifier si les données sont expirées
    if (Date.now() > cacheItem.expiry) {
      localStorage.removeItem(`${OFFLINE_CACHE_PREFIX}${key}`)
      localStorage.removeItem(`${OFFLINE_CACHE_META_PREFIX}${key}`)
      return null
    }

    // Mettre à jour le compteur d'accès
    updateAccessCount(key)

    // Décompresser si nécessaire
    if (cacheItem.compressed) {
      return decompressJSON<T>(cacheItem.data)
    } else {
      return JSON.parse(cacheItem.data) as T
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du cache hors ligne pour ${key}:`, error)
    return null
  }
}

/**
 * Calcule les statistiques d'utilisation du cache
 * @returns {CacheStats} Statistiques du cache
 */
export function getCacheStats(): CacheStats {
  if (typeof window === "undefined") {
    return {
      totalItems: 0,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 1,
      oldestItem: null,
      newestItem: null,
      expiringItems: 0,
      itemsByType: {},
      itemsByPriority: {
        [CachePriority.CRITICAL]: 0,
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
        [CachePriority.TEMPORARY]: 0,
      },
      sizeByPriority: {
        [CachePriority.CRITICAL]: 0,
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
        [CachePriority.TEMPORARY]: 0,
      },
      accessFrequency: {},
    }
  }

  try {
    let totalItems = 0
    let totalSize = 0
    let compressedSize = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0
    let expiringItems = 0
    const itemsByType: Record<string, number> = {}
    const itemsByPriority: Record<CachePriority, number> = {
      [CachePriority.CRITICAL]: 0,
      [CachePriority.HIGH]: 0,
      [CachePriority.MEDIUM]: 0,
      [CachePriority.LOW]: 0,
      [CachePriority.TEMPORARY]: 0,
    }
    const sizeByPriority: Record<CachePriority, number> = {
      [CachePriority.CRITICAL]: 0,
      [CachePriority.HIGH]: 0,
      [CachePriority.MEDIUM]: 0,
      [CachePriority.LOW]: 0,
      [CachePriority.TEMPORARY]: 0,
    }
    const accessFrequency: Record<string, number> = {}
    const now = Date.now()
    const oneDayFromNow = now + 24 * 60 * 60 * 1000

    // Parcourir tous les éléments du stockage local
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(OFFLINE_CACHE_META_PREFIX)) {
        try {
          const metaJson = localStorage.getItem(key)
          if (metaJson) {
            const metadata = JSON.parse(metaJson) as CacheItemMetadata
            totalItems++
            totalSize += metadata.originalSize
            compressedSize += metadata.compressedSize

            // Mettre à jour les statistiques de type
            const type = metadata.type || "unknown"
            itemsByType[type] = (itemsByType[type] || 0) + 1

            // Mettre à jour les statistiques de priorité
            if (metadata.priority in itemsByPriority) {
              itemsByPriority[metadata.priority]++
              sizeByPriority[metadata.priority] += metadata.originalSize
            }

            // Enregistrer la fréquence d'accès
            accessFrequency[metadata.key] = metadata.accessCount

            // Vérifier si c'est le plus ancien ou le plus récent
            if (metadata.timestamp < oldestTimestamp) {
              oldestTimestamp = metadata.timestamp
            }
            if (metadata.timestamp > newestTimestamp) {
              newestTimestamp = metadata.timestamp
            }

            // Vérifier si l'élément expire bientôt
            if (metadata.expiry < oneDayFromNow) {
              expiringItems++
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    })

    return {
      totalItems,
      totalSize,
      compressedSize,
      compressionRatio: totalSize > 0 ? totalSize / compressedSize : 1,
      oldestItem: oldestTimestamp !== Date.now() ? new Date(oldestTimestamp) : null,
      newestItem: newestTimestamp !== 0 ? new Date(newestTimestamp) : null,
      expiringItems,
      itemsByType,
      itemsByPriority,
      sizeByPriority,
      accessFrequency,
    }
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques du cache:", error)
    return {
      totalItems: 0,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 1,
      oldestItem: null,
      newestItem: null,
      expiringItems: 0,
      itemsByType: {},
      itemsByPriority: {
        [CachePriority.CRITICAL]: 0,
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
        [CachePriority.TEMPORARY]: 0,
      },
      sizeByPriority: {
        [CachePriority.CRITICAL]: 0,
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
        [CachePriority.TEMPORARY]: 0,
      },
      accessFrequency: {},
    }
  }
}

/**
 * Nettoie les éléments expirés du cache hors ligne
 * @param {boolean} [forceCleanup=false] - Si true, nettoie également les éléments non expirés pour libérer de l'espace
 * @returns {number} Nombre d'éléments supprimés
 */
export function cleanupOfflineCache(forceCleanup = false): number {
  if (typeof window === "undefined") {
    return 0
  }

  try {
    const now = Date.now()
    let itemsRemoved = 0

    // Collecter tous les éléments du cache avec leurs métadonnées
    const cacheItems: Array<{
      key: string
      meta: CacheItemMetadata
    }> = []

    // Parcourir tous les éléments du stockage local
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(OFFLINE_CACHE_META_PREFIX)) {
        try {
          const metaKey = key
          const dataKey = key.replace(OFFLINE_CACHE_META_PREFIX, OFFLINE_CACHE_PREFIX)
          const metaJson = localStorage.getItem(metaKey)

          if (metaJson) {
            const meta = JSON.parse(metaJson) as CacheItemMetadata

            // Si l'élément est expiré, le supprimer immédiatement
            if (now > meta.expiry) {
              localStorage.removeItem(metaKey)
              localStorage.removeItem(dataKey)
              itemsRemoved++
            } else if (forceCleanup) {
              // Sinon, l'ajouter à la liste pour un éventuel nettoyage forcé
              cacheItems.push({
                key: meta.key,
                meta,
              })
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    })

    // Si on doit faire un nettoyage forcé et qu'il reste des éléments
    if (forceCleanup && cacheItems.length > 0) {
      // Trier les éléments par priorité (du moins prioritaire au plus prioritaire)
      // et par date d'accès (les moins récemment accédés en premier)
      cacheItems.sort((a, b) => {
        // D'abord comparer les priorités
        const priorityOrder = {
          [CachePriority.TEMPORARY]: 0,
          [CachePriority.LOW]: 1,
          [CachePriority.MEDIUM]: 2,
          [CachePriority.HIGH]: 3,
          [CachePriority.CRITICAL]: 4,
        }

        const priorityDiff = priorityOrder[a.meta.priority] - priorityOrder[b.meta.priority]
        if (priorityDiff !== 0) {
          return priorityDiff
        }

        // Ensuite comparer les dates d'accès
        return a.meta.lastAccessed - b.meta.lastAccessed
      })

      // Ne jamais supprimer les éléments critiques
      const nonCriticalItems = cacheItems.filter((item) => item.meta.priority !== CachePriority.CRITICAL)

      // Calculer combien d'éléments on doit supprimer (50% des éléments non critiques)
      const itemsToRemove = Math.ceil(nonCriticalItems.length * 0.5)

      // Supprimer les éléments
      for (let i = 0; i < itemsToRemove && i < nonCriticalItems.length; i++) {
        const item = nonCriticalItems[i]
        localStorage.removeItem(`${OFFLINE_CACHE_META_PREFIX}${item.key}`)
        localStorage.removeItem(`${OFFLINE_CACHE_PREFIX}${item.key}`)
        itemsRemoved++
      }
    }

    return itemsRemoved
  } catch (error) {
    console.error("Erreur lors du nettoyage du cache hors ligne:", error)
    return 0
  }
}

/**
 * Récupère toutes les règles de priorité
 * @returns {PriorityRule[]} Liste des règles de priorité
 */
export function getPriorityRules(): PriorityRule[] {
  const settings = getOfflineSettings()
  return settings.priorityRules || DEFAULT_PRIORITY_RULES
}

/**
 * Sauvegarde une règle de priorité
 * @param {PriorityRule} rule - Règle à sauvegarder
 */
export function savePriorityRule(rule: PriorityRule): void {
  const settings = getOfflineSettings()
  const rules = settings.priorityRules || []

  // Vérifier si la règle existe déjà
  const index = rules.findIndex((r) => r.id === rule.id)

  if (index >= 0) {
    // Mettre à jour la règle existante
    rules[index] = rule
  } else {
    // Ajouter une nouvelle règle
    rules.push(rule)
  }

  saveOfflineSettings({ priorityRules: rules })
}

/**
 * Supprime une règle de priorité
 * @param {string} ruleId - ID de la règle à supprimer
 */
export function deletePriorityRule(ruleId: string): void {
  const settings = getOfflineSettings()
  const rules = settings.priorityRules || []

  const updatedRules = rules.filter((rule) => rule.id !== ruleId)

  saveOfflineSettings({ priorityRules: updatedRules })
}

/**
 * Réinitialise les règles de priorité aux valeurs par défaut
 */
export function resetPriorityRules(): void {
  saveOfflineSettings({ priorityRules: DEFAULT_PRIORITY_RULES })
}

/**
 * Récupère les éléments du cache par priorité
 * @param {CachePriority} priority - Priorité à filtrer
 * @returns {Array<{key: string, meta: CacheItemMetadata}>} Liste des éléments
 */
export function getCacheItemsByPriority(priority: CachePriority): Array<{ key: string; meta: CacheItemMetadata }> {
  if (typeof window === "undefined") {
    return []
  }

  const items: Array<{ key: string; meta: CacheItemMetadata }> = []

  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(OFFLINE_CACHE_META_PREFIX)) {
        try {
          const metaJson = localStorage.getItem(key)
          if (metaJson) {
            const meta = JSON.parse(metaJson) as CacheItemMetadata
            if (meta.priority === priority) {
              items.push({
                key: meta.key,
                meta,
              })
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    })
  } catch (error) {
    console.error(`Erreur lors de la récupération des éléments de priorité ${priority}:`, error)
  }

  return items
}

/**
 * Change la priorité d'un élément du cache
 * @param {string} key - Clé de l'élément
 * @param {CachePriority} priority - Nouvelle priorité
 * @returns {boolean} True si la priorité a été changée avec succès
 */
export function changeCacheItemPriority(key: string, priority: CachePriority): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const metadata = getCacheMetadata(key)
    if (metadata) {
      metadata.priority = priority

      // Mettre à jour la date d'expiration en fonction de la nouvelle priorité
      if (priority in PRIORITY_RETENTION) {
        if (PRIORITY_RETENTION[priority] === Number.POSITIVE_INFINITY) {
          metadata.expiry = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000 // 10 ans
        } else {
          metadata.expiry = Date.now() + PRIORITY_RETENTION[priority]
        }
      }

      localStorage.setItem(`${OFFLINE_CACHE_META_PREFIX}${key}`, JSON.stringify(metadata))
      return true
    }
    return false
  } catch (error) {
    console.error(`Erreur lors du changement de priorité pour ${key}:`, error)
    return false
  }
}

/**
 * Ajoute une action à la file d'attente hors ligne
 * @param {string} action - Type d'action
 * @param {any} payload - Données associées à l'action
 * @param {CachePriority} [priority=CachePriority.HIGH] - Priorité de l'action
 */
export function addToOfflineQueue(action: string, payload: any, priority: CachePriority = CachePriority.HIGH): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const settings = getOfflineSettings()
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY)
    const queue = queueJson ? JSON.parse(queueJson) : []

    // Compresser le payload si nécessaire
    let storedPayload = payload
    const jsonPayload = JSON.stringify(payload)
    const payloadSize = new Blob([jsonPayload]).size

    if (settings.compressionEnabled && payloadSize > settings.compressionThreshold) {
      storedPayload = compressJSON(payload)
    }

    queue.push({
      id: Date.now().toString(),
      action,
      payload: storedPayload,
      compressed: settings.compressionEnabled && payloadSize > settings.compressionThreshold,
      timestamp: Date.now(),
      priority,
    })

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Erreur lors de l'ajout à la file d'attente hors ligne:", error)
  }
}

/**
 * Récupère la file d'attente des actions hors ligne
 * @returns {Array} La file d'attente des actions
 */
export function getOfflineQueue(): any[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!queueJson) {
      return []
    }

    const queue = JSON.parse(queueJson)

    // Décompresser les payloads si nécessaire
    return queue.map((item: any) => {
      if (item.compressed) {
        return {
          ...item,
          payload: decompressJSON(item.payload),
        }
      }
      return item
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de la file d'attente hors ligne:", error)
    return []
  }
}

/**
 * Supprime une action de la file d'attente hors ligne
 * @param {string} id - ID de l'action à supprimer
 */
export function removeFromOfflineQueue(id: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!queueJson) {
      return
    }

    const queue = JSON.parse(queueJson)
    const updatedQueue = queue.filter((item: any) => item.id !== id)
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue))
  } catch (error) {
    console.error("Erreur lors de la suppression de la file d'attente hors ligne:", error)
  }
}

/**
 * Synchronise les données hors ligne avec le serveur
 * @returns {Promise<{success: boolean, processed: number, failed: number}>}
 */
export async function syncOfflineData(): Promise<{ success: boolean; processed: number; failed: number }> {
  if (typeof window === "undefined") {
    return { success: false, processed: 0, failed: 0 }
  }

  // Si nous sommes toujours hors ligne, ne pas essayer de synchroniser
  if (!navigator.onLine) {
    return { success: false, processed: 0, failed: 0 }
  }

  const queue = getOfflineQueue()

  if (queue.length === 0) {
    // Mettre à jour le timestamp de dernière synchronisation
    saveOfflineSettings({ lastSyncTimestamp: Date.now() })
    return { success: true, processed: 0, failed: 0 }
  }

  let processed = 0
  let failed = 0

  // Trier la file d'attente par priorité (du plus prioritaire au moins prioritaire)
  queue.sort((a, b) => {
    const priorityOrder = {
      [CachePriority.CRITICAL]: 0,
      [CachePriority.HIGH]: 1,
      [CachePriority.MEDIUM]: 2,
      [CachePriority.LOW]: 3,
      [CachePriority.TEMPORARY]: 4,
    }

    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
  })

  // Traiter chaque action dans la file d'attente
  for (const item of queue) {
    try {
      // Ici, vous devriez implémenter la logique pour traiter chaque type d'action
      // Par exemple, envoyer des requêtes API, mettre à jour des données, etc.

      // Pour l'instant, nous allons simplement simuler un traitement réussi
      console.log(`Traitement de l'action ${item.action} avec priorité ${item.priority || "standard"}:`, item.payload)

      // Supprimer l'action de la file d'attente
      removeFromOfflineQueue(item.id)
      processed++
    } catch (error) {
      console.error(`Erreur lors du traitement de l'action ${item.action}:`, error)
      failed++
    }
  }

  // Mettre à jour le timestamp de dernière synchronisation
  saveOfflineSettings({ lastSyncTimestamp: Date.now() })

  return {
    success: failed === 0,
    processed,
    failed,
  }
}

/**
 * Détecte les changements de connectivité et gère le mode hors ligne en conséquence
 */
export function setupOfflineDetection(): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleOnline = async () => {
    console.log("Connexion internet rétablie")

    const settings = getOfflineSettings()

    // Si la synchronisation automatique est activée, synchroniser les données
    if (settings.syncOnReconnect) {
      console.log("Synchronisation des données hors ligne...")
      const result = await syncOfflineData()
      console.log("Résultat de la synchronisation:", result)
    }
  }

  const handleOffline = () => {
    console.log("Connexion internet perdue")

    // Si la détection automatique est activée, activer le mode hors ligne
    const settings = getOfflineSettings()
    if (settings.autoDetect) {
      saveOfflineSettings({ enabled: true })
    }
  }

  // Ajouter les écouteurs d'événements
  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Retourner une fonction pour supprimer les écouteurs
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

/**
 * Initialise le mode hors ligne
 */
export function initOfflineMode(): void {
  if (typeof window === "undefined") {
    return
  }

  // Nettoyer le cache expiré
  cleanupOfflineCache()

  // Configurer la détection de connectivité
  setupOfflineDetection()

  // Vérifier si nous sommes déjà hors ligne
  if (!navigator.onLine) {
    const settings = getOfflineSettings()
    if (settings.autoDetect) {
      saveOfflineSettings({ enabled: true })
    }
  }

  // Configurer le nettoyage automatique périodique
  const settings = getOfflineSettings()
  if (settings.autoCleanupEnabled) {
    setInterval(() => {
      cleanupOfflineCache()
    }, settings.autoCleanupInterval)
  }
}

/**
 * Analyse l'utilisation du stockage hors ligne
 * @returns {StorageAnalysis} Analyse de l'utilisation du stockage
 */
export function analyzeStorageUsage(): StorageAnalysis {
  if (typeof window === "undefined") {
    return {
      totalSize: 0,
      usagePercentage: 0,
      itemCount: 0,
      lastUpdated: Date.now(),
      itemsByCategory: {},
      sizeByCategory: {},
      quota: 0,
      available: 0,
    }
  }

  try {
    const stats = getCacheStats()
    const settings = getOfflineSettings()
    const quota = settings.storageQuota || 50 * 1024 * 1024 // 50MB par défaut
    const usagePercentage = (stats.totalSize / quota) * 100

    // Organiser les éléments par catégorie
    const itemsByCategory: Record<string, number> = {}
    const sizeByCategory: Record<string, number> = {}

    // Parcourir tous les éléments du stockage local pour les catégoriser
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(OFFLINE_CACHE_META_PREFIX)) {
        try {
          const metaJson = localStorage.getItem(key)
          if (metaJson) {
            const metadata = JSON.parse(metaJson) as CacheItemMetadata
            const category = metadata.category || "other"

            // Incrémenter le compteur d'éléments pour cette catégorie
            itemsByCategory[category] = (itemsByCategory[category] || 0) + 1

            // Ajouter la taille à cette catégorie
            sizeByCategory[category] = (sizeByCategory[category] || 0) + metadata.originalSize
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    })

    return {
      totalSize: stats.totalSize,
      usagePercentage: Math.min(100, usagePercentage),
      itemCount: stats.totalItems,
      lastUpdated: Date.now(),
      itemsByCategory,
      sizeByCategory,
      quota,
      available: Math.max(0, quota - stats.totalSize),
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'utilisation du stockage:", error)
    return {
      totalSize: 0,
      usagePercentage: 0,
      itemCount: 0,
      lastUpdated: Date.now(),
      itemsByCategory: {},
      sizeByCategory: {},
      quota: 0,
      available: 0,
    }
  }
}
