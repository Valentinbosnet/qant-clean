// Types for offline mode
export enum CachePriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  TEMPORARY = "temporary",
}

export interface OfflineSettings {
  enabled: boolean
  autoDetect: boolean
  syncOnReconnect: boolean
  compressionEnabled: boolean
  compressionThreshold: number // in bytes
  storageQuota: number // in bytes
  maxCacheAge: number // in milliseconds
  priorityThresholds: {
    [CachePriority.HIGH]: number
    [CachePriority.MEDIUM]: number
    [CachePriority.LOW]: number
  }
  storageLimit: number // in MB
  prioritizeEssentialData: boolean
  expiryDays: number
}

export interface CacheMetadata {
  timestamp: number
  type: string
  priority: CachePriority
  category?: string
  tags?: string[]
  size?: number
  originalSize?: number
  compressed?: boolean
  lastAccessed?: number
  accessCount?: number
}

export interface StorageAnalysis {
  totalUsage: number
  availableSpace: number
  usagePercentage: number
  largestItems: Array<{ key: string; size: number; type: string }>
  itemsByCategory: Record<string, number>
  sizeByCategory: Record<string, number>
  suggestions: string[]
}

export interface CacheStats {
  totalItems: number
  totalSize: number
  compressedSize: number
  compressionRatio: number
  itemsByType: Record<string, number>
  itemsByPriority: Record<CachePriority, number>
  sizeByPriority: Record<CachePriority, number>
}

export interface PriorityRule {
  id: string
  pattern: string
  type?: string
  priority: CachePriority
  enabled: boolean
}

export const PRIORITY_RETENTION: Record<CachePriority, number> = {
  [CachePriority.CRITICAL]: Number.POSITIVE_INFINITY,
  [CachePriority.HIGH]: 30 * 24 * 60 * 60 * 1000, // 30 days
  [CachePriority.MEDIUM]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [CachePriority.LOW]: 3 * 24 * 60 * 60 * 1000, // 3 days
  [CachePriority.TEMPORARY]: 1 * 24 * 60 * 60 * 1000, // 1 day
}

// Default settings
const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: false,
  autoDetect: true,
  syncOnReconnect: true,
  compressionEnabled: false,
  compressionThreshold: 1024, // 1KB
  storageQuota: 50 * 1024 * 1024, // 50MB
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  priorityThresholds: {
    [CachePriority.HIGH]: 30 * 24 * 60 * 60 * 1000, // 30 days
    [CachePriority.MEDIUM]: 14 * 24 * 60 * 60 * 1000, // 14 days
    [CachePriority.LOW]: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  storageLimit: 50, // 50MB
  prioritizeEssentialData: true,
  expiryDays: 7,
}

// Local storage keys
const OFFLINE_MODE_KEY = "offlineMode"
const OFFLINE_SETTINGS_KEY = "offlineSettings"
const OFFLINE_USER_KEY = "offlineUser"

/**
 * Check if offline mode is enabled
 * @returns {boolean} True if offline mode is enabled
 */
export function isOfflineMode(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const offlineMode = localStorage.getItem(OFFLINE_MODE_KEY)
    return offlineMode === "true"
  } catch (error) {
    console.error("Error checking offline mode:", error)
    return false
  }
}

/**
 * Check if offline mode is enabled
 * This alias is used for better semantics in some files
 * @returns {boolean} True if offline mode is enabled
 */
export function isOfflineModeEnabled(): boolean {
  return isOfflineMode()
}

/**
 * Set offline mode
 * @param {boolean} enabled - Whether offline mode should be enabled
 */
export function setOfflineMode(enabled: boolean): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(OFFLINE_MODE_KEY, enabled.toString())
  } catch (error) {
    console.error("Error setting offline mode:", error)
  }
}

/**
 * Get offline user
 * @returns {any} Offline user data or null if not found
 */
export function getOfflineUser(): any {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const userData = localStorage.getItem(OFFLINE_USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error getting offline user:", error)
    return null
  }
}

/**
 * Authenticate offline user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<any>} Authenticated user data or null if authentication fails
 */
export async function authenticateOfflineUser(email: string, password: string): Promise<any> {
  if (typeof window === "undefined") {
    return null
  }

  // In a real app, you would use a proper authentication mechanism
  // This is a simplified version for demonstration purposes
  const storedUser = localStorage.getItem(OFFLINE_USER_KEY)
  if (!storedUser) {
    return null
  }

  const user = JSON.parse(storedUser)

  // Very basic check - in a real app, you would use proper password hashing
  if (user.email === email && user.hashedPassword === hashPassword(password)) {
    return user
  }

  return null
}

/**
 * Sign out offline user
 */
export async function signOutOfflineUser(): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(OFFLINE_USER_KEY)
}

/**
 * Store offline user
 * @param {any} user - User data
 * @param {string} password - User password
 */
export function storeOfflineUser(user: any, password: string): void {
  if (typeof window === "undefined") {
    return
  }

  // Store user with hashed password
  const userToStore = {
    ...user,
    hashedPassword: hashPassword(password),
  }

  localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(userToStore))
}

// Simple hash function for demonstration - DO NOT use in production
export function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString()
}

/**
 * Save data to offline cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {CacheMetadata} metadata - Cache metadata
 */
export function saveToOfflineCache(key: string, data: any, metadata?: Partial<CacheMetadata>): void {
  if (typeof window === "undefined" || !key) {
    return
  }

  try {
    // Check if offline mode is enabled
    const settings = getOfflineSettings()
    if (!settings.enabled && !isOfflineMode()) {
      return
    }

    // Prepare data
    const jsonData = JSON.stringify(data)
    const timestamp = Date.now()

    // Default metadata
    const defaultMetadata: CacheMetadata = {
      timestamp,
      type: "json",
      priority: CachePriority.MEDIUM,
      accessCount: 0,
      originalSize: new Blob([jsonData]).size,
      ...metadata,
    }

    // Save data and metadata
    localStorage.setItem(`offline_${key}`, jsonData)
    localStorage.setItem(`offline_meta_${key}`, JSON.stringify(defaultMetadata))
  } catch (error) {
    console.error(`Error saving to offline cache (${key}):`, error)
  }
}

/**
 * Get data from offline cache
 * @param {string} key - Cache key
 * @returns {any} Cached data or null if not found
 */
export function getFromOfflineCache(key: string): any {
  if (typeof window === "undefined" || !key) {
    return null
  }

  try {
    // Get data from cache
    const jsonData = localStorage.getItem(`offline_${key}`)
    if (!jsonData) {
      return null
    }

    // Update metadata
    try {
      const metaKey = `offline_meta_${key}`
      const metaJson = localStorage.getItem(metaKey)
      if (metaJson) {
        const metadata = JSON.parse(metaJson)
        metadata.lastAccessed = Date.now()
        metadata.accessCount = (metadata.accessCount || 0) + 1
        localStorage.setItem(metaKey, JSON.stringify(metadata))
      }
    } catch (e) {
      // Ignore metadata errors
    }

    // Return data
    return JSON.parse(jsonData)
  } catch (error) {
    console.error(`Error getting from offline cache (${key}):`, error)
    return null
  }
}

/**
 * Remove data from offline cache
 * @param {string} key - Cache key
 */
export function removeFromOfflineCache(key: string): void {
  if (typeof window === "undefined" || !key) {
    return
  }

  try {
    localStorage.removeItem(`offline_${key}`)
    localStorage.removeItem(`offline_meta_${key}`)
  } catch (error) {
    console.error(`Error removing from offline cache (${key}):`, error)
  }
}

/**
 * Clear all offline cache
 */
export function clearOfflineCache(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    // Only clear items that start with 'offline_'
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("offline_")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing offline cache:", error)
  }
}

/**
 * Get offline settings
 * @returns {OfflineSettings} Offline settings
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
    console.error("Error getting offline settings:", error)
    return DEFAULT_OFFLINE_SETTINGS
  }
}

/**
 * Save offline settings
 * @param {OfflineSettings} settings - Settings to save
 */
export function saveOfflineSettings(settings: OfflineSettings): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(OFFLINE_SETTINGS_KEY, JSON.stringify(settings))
    // Also update the main offline mode flag for consistency
    setOfflineMode(settings.enabled)
  } catch (error) {
    console.error("Error saving offline settings:", error)
  }
}

/**
 * Get cache statistics
 * @returns {CacheStats} Cache statistics
 */
export function getCacheStats(): CacheStats {
  const defaultStats: CacheStats = {
    totalItems: 0,
    totalSize: 0,
    compressedSize: 0,
    compressionRatio: 1,
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
  }

  if (typeof window === "undefined") {
    return defaultStats
  }

  try {
    const stats = { ...defaultStats }

    // Go through all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith("offline_meta_")) continue

      const dataKey = key.replace("offline_meta_", "offline_")
      const metaJson = localStorage.getItem(key)
      const dataJson = localStorage.getItem(dataKey)

      if (!metaJson || !dataJson) continue

      const metadata = JSON.parse(metaJson) as CacheMetadata
      const size = metadata.originalSize || new Blob([dataJson]).size
      const compressedSize = metadata.compressed ? new Blob([dataJson]).size : size

      stats.totalItems++
      stats.totalSize += size
      stats.compressedSize += compressedSize

      // Count by type
      const type = metadata.type || "unknown"
      stats.itemsByType[type] = (stats.itemsByType[type] || 0) + 1

      // Count by priority
      const priority = metadata.priority || CachePriority.MEDIUM
      stats.itemsByPriority[priority] = (stats.itemsByPriority[priority] || 0) + 1
      stats.sizeByPriority[priority] = (stats.sizeByPriority[priority] || 0) + size
    }

    // Calculate compression ratio
    if (stats.totalSize > 0) {
      stats.compressionRatio = stats.totalSize / Math.max(stats.compressedSize, 1)
    }

    return stats
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return defaultStats
  }
}

/**
 * Analyze storage usage
 * @returns {StorageAnalysis} Storage usage analysis
 */
export function analyzeStorageUsage(): StorageAnalysis {
  const defaultAnalysis: StorageAnalysis = {
    totalUsage: 0,
    availableSpace: 0,
    usagePercentage: 0,
    largestItems: [],
    itemsByCategory: {},
    sizeByCategory: {},
    suggestions: [],
  }

  if (typeof window === "undefined") {
    return defaultAnalysis
  }

  try {
    // Calculate total localStorage usage
    let totalSize = 0
    const items: Array<{ key: string; size: number; type: string }> = []
    const categories: Record<string, number> = {}
    const categorySizes: Record<string, number> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ""
      const value = localStorage.getItem(key) || ""
      const size = new Blob([value]).size

      totalSize += size

      if (key.startsWith("offline_")) {
        // Extract category from key if possible
        const parts = key.split("_")
        const category = parts.length > 2 ? parts[1] : "general"

        categories[category] = (categories[category] || 0) + 1
        categorySizes[category] = (categorySizes[category] || 0) + size

        // Get metadata if available
        let type = "unknown"
        if (localStorage.getItem(`offline_meta_${key.substring(8)}`)) {
          try {
            const meta = JSON.parse(localStorage.getItem(`offline_meta_${key.substring(8)}`) || "{}")
            type = meta.type || "unknown"
          } catch (e) {
            // Ignore parsing errors
          }
        }

        items.push({ key, size, type })
      }
    }

    // Sort items by size (descending)
    items.sort((a, b) => b.size - a.size)

    // Generate suggestions
    const suggestions: string[] = []

    if (totalSize > 5 * 1024 * 1024) {
      // More than 5MB
      suggestions.push("Your offline cache is quite large. Consider enabling compression.")
    }

    const settings = getOfflineSettings()
    if (settings.compressionEnabled && settings.compressionThreshold > 10240) {
      suggestions.push("Your compression threshold is high. Consider lowering it to compress more data.")
    }

    if (items.filter((i) => i.size > 1024 * 1024).length > 3) {
      suggestions.push("You have several large items in your cache. Review them to ensure they're necessary.")
    }

    // Estimate available space (5MB is a conservative estimate for remaining localStorage)
    const estimatedTotal = 10 * 1024 * 1024 // Assume 10MB total (conservative)
    const availableSpace = Math.max(0, estimatedTotal - totalSize)
    const usagePercentage = (totalSize / estimatedTotal) * 100

    return {
      totalUsage: totalSize,
      availableSpace,
      usagePercentage,
      largestItems: items.slice(0, 10),
      itemsByCategory: categories,
      sizeByCategory: categorySizes,
      suggestions,
    }
  } catch (error) {
    console.error("Error analyzing storage usage:", error)
    return defaultAnalysis
  }
}

/**
 * Clean up offline cache based on expiration and priority
 * @param {boolean} force - Force cleanup even if space is available
 * @returns {number} Number of items removed
 */
export function cleanupOfflineCache(force = false): number {
  if (typeof window === "undefined") {
    return 0
  }

  try {
    const settings = getOfflineSettings()
    const now = Date.now()
    const stats = getCacheStats()
    let removed = 0

    // Only clean up if we're using more than 80% of quota or if forced
    if (!force && stats.totalSize < settings.storageQuota * 0.8) {
      return 0
    }

    // Find all metadata keys
    const metaKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("offline_meta_")) {
        metaKeys.push(key)
      }
    }

    // Check each item
    for (const metaKey of metaKeys) {
      try {
        const metaJson = localStorage.getItem(metaKey)
        if (!metaJson) continue

        const metadata = JSON.parse(metaJson) as CacheMetadata
        const dataKey = `offline_${metaKey.substring(13)}`

        // Get retention time based on priority
        const retention = PRIORITY_RETENTION[metadata.priority] || settings.maxCacheAge

        // Skip critical items unless forced
        if (metadata.priority === CachePriority.CRITICAL && !force) {
          continue
        }

        // Check if expired
        if (now - (metadata.timestamp || 0) > retention) {
          localStorage.removeItem(metaKey)
          localStorage.removeItem(dataKey)
          removed++
        }
      } catch (itemError) {
        console.error(`Error checking cache item (${metaKey}):`, itemError)
      }
    }

    return removed
  } catch (error) {
    console.error("Error cleaning up offline cache:", error)
    return 0
  }
}

/**
 * Get priority rules
 * @returns {PriorityRule[]} Priority rules
 */
export function getPriorityRules(): PriorityRule[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rulesJson = localStorage.getItem("offline_priority_rules")
    if (!rulesJson) {
      // Default rules
      const defaultRules: PriorityRule[] = [
        {
          id: "rule_critical",
          pattern: "*auth*",
          priority: CachePriority.CRITICAL,
          enabled: true,
        },
        {
          id: "rule_high",
          pattern: "*user*",
          priority: CachePriority.HIGH,
          enabled: true,
        },
        {
          id: "rule_low",
          pattern: "*temp*",
          priority: CachePriority.LOW,
          enabled: true,
        },
      ]
      localStorage.setItem("offline_priority_rules", JSON.stringify(defaultRules))
      return defaultRules
    }

    return JSON.parse(rulesJson)
  } catch (error) {
    console.error("Error getting priority rules:", error)
    return []
  }
}

/**
 * Save priority rule
 * @param {PriorityRule} rule - Rule to save
 * @returns {boolean} True if successful
 */
export function savePriorityRule(rule: PriorityRule): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const rules = getPriorityRules()
    const index = rules.findIndex((r) => r.id === rule.id)

    if (index >= 0) {
      rules[index] = rule
    } else {
      rules.push(rule)
    }

    localStorage.setItem("offline_priority_rules", JSON.stringify(rules))
    return true
  } catch (error) {
    console.error("Error saving priority rule:", error)
    return false
  }
}

/**
 * Delete priority rule
 * @param {string} ruleId - ID of rule to delete
 * @returns {boolean} True if successful
 */
export function deletePriorityRule(ruleId: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const rules = getPriorityRules()
    const newRules = rules.filter((r) => r.id !== ruleId)

    localStorage.setItem("offline_priority_rules", JSON.stringify(newRules))
    return true
  } catch (error) {
    console.error("Error deleting priority rule:", error)
    return false
  }
}

/**
 * Reset priority rules to defaults
 * @returns {boolean} True if successful
 */
export function resetPriorityRules(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const defaultRules: PriorityRule[] = [
      {
        id: "rule_critical",
        pattern: "*auth*",
        priority: CachePriority.CRITICAL,
        enabled: true,
      },
      {
        id: "rule_high",
        pattern: "*user*",
        priority: CachePriority.HIGH,
        enabled: true,
      },
      {
        id: "rule_low",
        pattern: "*temp*",
        priority: CachePriority.LOW,
        enabled: true,
      },
    ]

    localStorage.setItem("offline_priority_rules", JSON.stringify(defaultRules))
    return true
  } catch (error) {
    console.error("Error resetting priority rules:", error)
    return false
  }
}

/**
 * Get cache items by priority
 * @param {CachePriority} priority - Priority to filter by
 * @returns {Array<{key: string, meta: any}>} Cache items with the specified priority
 */
export function getCacheItemsByPriority(priority: CachePriority): Array<{ key: string; meta: any }> {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const result: Array<{ key: string; meta: any }> = []

    // Find all metadata keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith("offline_meta_")) continue

      const metaJson = localStorage.getItem(key)
      if (!metaJson) continue

      try {
        const meta = JSON.parse(metaJson)
        if (meta.priority === priority) {
          result.push({
            key: key.substring(13), // Remove "offline_meta_"
            meta,
          })
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return result
  } catch (error) {
    console.error("Error getting cache items by priority:", error)
    return []
  }
}

/**
 * Change cache item priority
 * @param {string} key - Cache key
 * @param {CachePriority} priority - New priority
 * @returns {boolean} True if successful
 */
export function changeCacheItemPriority(key: string, priority: CachePriority): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const metaKey = `offline_meta_${key}`
    const metaJson = localStorage.getItem(metaKey)

    if (!metaJson) return false

    const meta = JSON.parse(metaJson)
    meta.priority = priority

    localStorage.setItem(metaKey, JSON.stringify(meta))
    return true
  } catch (error) {
    console.error("Error changing cache item priority:", error)
    return false
  }
}

/**
 * Compress all cache data
 * @returns {Promise<{processed: number, saved: number}>} Compression results
 */
export async function compressAllCacheData(): Promise<{ processed: number; saved: number }> {
  if (typeof window === "undefined") {
    return { processed: 0, saved: 0 }
  }

  try {
    const settings = getOfflineSettings()
    if (!settings.compressionEnabled) {
      return { processed: 0, saved: 0 }
    }

    let processed = 0
    let totalSaved = 0

    // Find all data keys
    const dataKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("offline_") && !key.startsWith("offline_meta_")) {
        dataKeys.push(key)
      }
    }

    // Process each item (simplified - no actual compression in this example)
    for (const dataKey of dataKeys) {
      try {
        const metaKey = `offline_meta_${dataKey.substring(8)}`
        const metaJson = localStorage.getItem(metaKey)

        if (!metaJson) continue

        const meta = JSON.parse(metaJson)
        if (meta.compressed) continue // Already compressed

        const data = localStorage.getItem(dataKey)
        if (!data) continue

        const originalSize = new Blob([data]).size

        // Skip small items
        if (originalSize < settings.compressionThreshold) {
          continue
        }

        // In a real implementation, you would compress the data here
        // For this example, we'll just mark it as compressed
        meta.originalSize = originalSize
        meta.compressed = true

        // Save updated metadata
        localStorage.setItem(metaKey, JSON.stringify(meta))

        processed++
        totalSaved += originalSize * 0.3 // Simulate 30% space savings
      } catch (itemError) {
        console.error(`Error processing cache item (${dataKey}):`, itemError)
      }
    }

    return {
      processed,
      saved: Math.round(totalSaved),
    }
  } catch (error) {
    console.error("Error compressing cache data:", error)
    return { processed: 0, saved: 0 }
  }
}

// Define event handlers outside of initOfflineMode to fix the reference error
const handleOffline = () => {
  console.log("Network is offline, enabling offline mode")
  setOfflineMode(true)
}

const handleOnline = () => {
  console.log("Network is online")
  const settings = getOfflineSettings()
  if (settings.syncOnReconnect) {
    console.log("Syncing offline data...")
    syncOfflineData().then((success) => {
      if (success) {
        console.log("Sync successful")
      } else {
        console.log("Sync failed")
      }
    })
  }

  // Only disable offline mode if it's set to auto-detect
  if (settings.autoDetect) {
    setOfflineMode(false)
  }
}

/**
 * Initialize offline mode
 * This function sets up offline mode and returns a cleanup function
 * @returns {() => void} Cleanup function
 */
export function initOfflineMode(): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  console.log("Initializing offline mode...")

  // Load settings
  const settings = getOfflineSettings()

  // Set up auto-detection if enabled
  let networkCheckInterval: NodeJS.Timeout | null = null
  if (settings.autoDetect) {
    // Set up event listeners for online/offline events
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    // Check network status periodically
    networkCheckInterval = setInterval(() => {
      if (!navigator.onLine && !isOfflineMode() && settings.autoDetect) {
        console.log("Network check detected offline status")
        setOfflineMode(true)
      }
    }, 30000) // Check every 30 seconds

    // Initial check
    if (!navigator.onLine && settings.autoDetect) {
      setOfflineMode(true)
    }
  }

  // Set up periodic cache cleanup
  const cleanupInterval = setInterval(() => {
    const removedCount = cleanupOfflineCache()
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} expired cache items`)
    }
  }, 3600000) // Run every hour

  // Return cleanup function
  return () => {
    if (networkCheckInterval) {
      clearInterval(networkCheckInterval)
    }
    clearInterval(cleanupInterval)
    window.removeEventListener("offline", handleOffline)
    window.removeEventListener("online", handleOnline)
  }
}

/**
 * Synchronize offline data with the server
 * @returns {Promise<boolean>} True if synchronization was successful
 */
export async function syncOfflineData(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return false
  }

  try {
    // In a real implementation, this would send cached data to the server
    // For now, we'll just simulate a successful sync
    console.log("Synchronizing offline data with server...")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Synchronization complete")
    return true
  } catch (error) {
    console.error("Error synchronizing offline data:", error)
    return false
  }
}

/**
 * Get all offline users
 * @returns {any[]} Array of offline users
 */
export function getOfflineUsers(): any[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const usersJson = localStorage.getItem("offline_users")
    return usersJson ? JSON.parse(usersJson) : []
  } catch (error) {
    console.error("Error getting offline users:", error)
    return []
  }
}

/**
 * Add offline user
 * @param {any} user - User to add
 * @param {string} password - User password
 * @returns {boolean} True if successful
 */
export function addOfflineUser(user: any, password: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const users = getOfflineUsers()
    const userToAdd = {
      ...user,
      hashedPassword: hashPassword(password),
      id: user.id || Date.now().toString(),
    }

    // Check if user already exists
    const existingIndex = users.findIndex((u) => u.email === user.email)
    if (existingIndex >= 0) {
      users[existingIndex] = userToAdd
    } else {
      users.push(userToAdd)
    }

    localStorage.setItem("offline_users", JSON.stringify(users))
    return true
  } catch (error) {
    console.error("Error adding offline user:", error)
    return false
  }
}

/**
 * Get current offline user
 * @returns {any} Current offline user or null
 */
export function getCurrentOfflineUser(): any {
  return getOfflineUser()
}

/**
 * Check if user is offline authenticated
 * @returns {boolean} True if authenticated offline
 */
export function isOfflineAuthenticated(): boolean {
  return getOfflineUser() !== null
}

/**
 * Check internet connection
 * @returns {Promise<boolean>} True if connected
 */
export async function checkInternetConnection(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const response = await fetch("/api/health", {
      method: "HEAD",
      cache: "no-cache",
    })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Toggle offline mode
 * @returns {boolean} New offline mode state
 */
export function toggleOfflineMode(): boolean {
  const currentMode = isOfflineMode()
  const newMode = !currentMode
  setOfflineMode(newMode)
  return newMode
}

/**
 * Add to offline queue
 * @param {any} action - Action to queue
 * @returns {boolean} True if successful
 */
export function addToOfflineQueue(action: any): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const queueJson = localStorage.getItem("offline_queue")
    const queue = queueJson ? JSON.parse(queueJson) : []

    queue.push({
      ...action,
      timestamp: Date.now(),
      id: Date.now().toString(),
    })

    localStorage.setItem("offline_queue", JSON.stringify(queue))
    return true
  } catch (error) {
    console.error("Error adding to offline queue:", error)
    return false
  }
}
