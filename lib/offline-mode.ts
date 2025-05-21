// Types for offline mode
export enum CachePriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export interface OfflineSettings {
  enabled: boolean
  autoDetect: boolean
  syncOnReconnect: boolean
  compressionEnabled: boolean
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
  lastAccessed?: number
  accessCount?: number
}

export interface StorageUsage {
  totalItems: number
  totalSize: number
  usagePercentage: number
  itemsByPriority: {
    [key in CachePriority]: number
  }
  sizeByPriority: {
    [key in CachePriority]: number
  }
  itemsByCategory: Record<string, number>
  sizeByCategory: Record<string, number>
}

// Default settings
const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: false,
  autoDetect: true,
  syncOnReconnect: true,
  compressionEnabled: false,
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
    const handleOffline = () => {
      console.log("Network is offline, enabling offline mode")
      setOfflineMode(true)
    }

    const handleOnline = () => {
      console.log("Network is online")
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
    const removedCount = cleanupExpiredCache()
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
 */
export function saveToOfflineCache(key: string, data: any): void {
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

    // Save data
    localStorage.setItem(`offline_${key}`, jsonData)
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
 * Analyze storage usage
 * @returns {StorageUsage} Storage usage statistics
 */
export function analyzeStorageUsage(): StorageUsage {
  if (typeof window === "undefined") {
    return {
      totalItems: 0,
      totalSize: 0,
      usagePercentage: 0,
      itemsByPriority: {
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
      },
      sizeByPriority: {
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
      },
      itemsByCategory: {},
      sizeByCategory: {},
    }
  }

  try {
    let totalItems = 0
    let totalSize = 0
    const itemsByPriority = {
      [CachePriority.HIGH]: 0,
      [CachePriority.MEDIUM]: 0,
      [CachePriority.LOW]: 0,
    }
    const sizeByPriority = {
      [CachePriority.HIGH]: 0,
      [CachePriority.MEDIUM]: 0,
      [CachePriority.LOW]: 0,
    }
    const itemsByCategory: Record<string, number> = {}
    const sizeByCategory: Record<string, number> = {}

    // Analyze all cache items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("offline_")) {
        const dataJson = localStorage.getItem(key)

        if (dataJson) {
          const size = new Blob([dataJson]).size

          // Update counters
          totalItems++
          totalSize += size

          // Update by category
          const category = key.split("_")[1] || "general"
          itemsByCategory[category] = (itemsByCategory[category] || 0) + 1
          sizeByCategory[category] = (sizeByCategory[category] || 0) + size
        }
      }
    }

    // Calculate usage percentage
    const settings = getOfflineSettings()
    const usagePercentage = settings.storageQuota > 0 ? (totalSize / settings.storageQuota) * 100 : 0

    return {
      totalItems,
      totalSize,
      usagePercentage,
      itemsByPriority,
      sizeByPriority,
      itemsByCategory,
      sizeByCategory,
    }
  } catch (error) {
    console.error("Error analyzing storage usage:", error)
    return {
      totalItems: 0,
      totalSize: 0,
      usagePercentage: 0,
      itemsByPriority: {
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
      },
      sizeByPriority: {
        [CachePriority.HIGH]: 0,
        [CachePriority.MEDIUM]: 0,
        [CachePriority.LOW]: 0,
      },
      itemsByCategory: {},
      sizeByCategory: {},
    }
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
 * Clean up expired cache items
 * @returns {number} Number of items removed
 */
export function cleanupExpiredCache(): number {
  if (typeof window === "undefined") {
    return 0
  }

  try {
    const settings = getOfflineSettings()
    const now = Date.now()
    let removedCount = 0

    // Find all cache items
    const keysToCheck: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("offline_")) {
        keysToCheck.push(key)
      }
    }

    // Check each item for expiration
    keysToCheck.forEach((key) => {
      try {
        // Get the timestamp from metadata or use a default expiration
        const timestamp = Date.now() - settings.maxCacheAge * 2 // Default to twice the max age

        // Check if expired
        if (now - timestamp > settings.maxCacheAge) {
          localStorage.removeItem(key)
          removedCount++
        }
      } catch (itemError) {
        console.error(`Error checking cache item (${key}):`, itemError)
      }
    })

    return removedCount
  } catch (error) {
    console.error("Error cleaning up expired cache:", error)
    return 0
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
