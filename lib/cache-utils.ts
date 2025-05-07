// Cache configuration
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Interface for cached items
interface CachedItem<T> {
  data: T
  timestamp: number
  expiry: number
}

/**
 * Saves data to localStorage with an expiration time
 */
export function saveToCache<T>(key: string, data: T, duration = DEFAULT_CACHE_DURATION): void {
  try {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration,
    }

    localStorage.setItem(`stock_cache_${key}`, JSON.stringify(item))

    // Log cache storage for debugging
    console.log(`Cached data for ${key}, expires in ${Math.round(duration / 60000)} minutes`)
  } catch (error) {
    console.error("Error saving to cache:", error)
    // If localStorage is full, clear old cache items
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearOldCacheItems()
    }
  }
}

/**
 * Retrieves data from localStorage if it exists and hasn't expired
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(`stock_cache_${key}`)

    if (!cachedData) {
      return null
    }

    const item: CachedItem<T> = JSON.parse(cachedData)
    const now = Date.now()

    // Check if the cached data has expired
    if (now > item.expiry) {
      // Remove expired item
      localStorage.removeItem(`stock_cache_${key}`)
      return null
    }

    // Calculate and log remaining cache time
    const remainingTime = Math.round((item.expiry - now) / 60000)
    console.log(`Using cached data for ${key}, expires in ${remainingTime} minutes`)

    return item.data
  } catch (error) {
    console.error("Error retrieving from cache:", error)
    return null
  }
}

/**
 * Clears all cached stock data
 */
export function clearCache(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("stock_cache_")) {
        localStorage.removeItem(key)
      }
    })
    console.log("Cache cleared successfully")
  } catch (error) {
    console.error("Error clearing cache:", error)
  }
}

/**
 * Clears specific cached item
 */
export function clearCacheItem(key: string): void {
  try {
    localStorage.removeItem(`stock_cache_${key}`)
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error)
  }
}

/**
 * Clears old cache items when storage is full
 */
function clearOldCacheItems(): void {
  try {
    const cacheKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("stock_cache_"))
      .map((key) => {
        try {
          const item = JSON.parse(localStorage.getItem(key) || "{}")
          return { key, timestamp: item.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by oldest first

    // Remove the oldest 20% of items
    const itemsToRemove = Math.max(1, Math.ceil(cacheKeys.length * 0.2))
    cacheKeys.slice(0, itemsToRemove).forEach((item) => {
      localStorage.removeItem(item.key)
    })

    console.log(`Cleared ${itemsToRemove} old cache items to free up space`)
  } catch (error) {
    console.error("Error clearing old cache items:", error)
  }
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): {
  itemCount: number
  totalSize: number
  oldestItem: Date | null
  newestItem: Date | null
} {
  try {
    let totalSize = 0
    let oldestTimestamp = Number.POSITIVE_INFINITY
    let newestTimestamp = 0
    let itemCount = 0

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("stock_cache_")) {
        const item = localStorage.getItem(key) || ""
        totalSize += item.length * 2 // Approximate size in bytes (2 bytes per character)
        itemCount++

        try {
          const parsed = JSON.parse(item)
          if (parsed.timestamp) {
            oldestTimestamp = Math.min(oldestTimestamp, parsed.timestamp)
            newestTimestamp = Math.max(newestTimestamp, parsed.timestamp)
          }
        } catch {
          // Ignore parsing errors
        }
      }
    })

    return {
      itemCount,
      totalSize,
      oldestItem: oldestTimestamp !== Number.POSITIVE_INFINITY ? new Date(oldestTimestamp) : null,
      newestItem: newestTimestamp !== 0 ? new Date(newestTimestamp) : null,
    }
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return { itemCount: 0, totalSize: 0, oldestItem: null, newestItem: null }
  }
}
