/**
 * Simple utility to throttle API requests to stay within rate limits
 */
class ApiThrottler {
  private static instance: ApiThrottler
  private requestTimestamps: number[] = []
  private isThrottled = false
  private throttleDuration: number = 60 * 1000 // 60 seconds
  private maxRequestsPerMinute = 5

  private constructor() {
    // Clean up old timestamps every minute
    setInterval(() => {
      this.cleanOldTimestamps()
    }, 60 * 1000)
  }

  public static getInstance(): ApiThrottler {
    if (!ApiThrottler.instance) {
      ApiThrottler.instance = new ApiThrottler()
    }
    return ApiThrottler.instance
  }

  private cleanOldTimestamps(): void {
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < this.throttleDuration)

    // Reset throttle if we're below the limit
    if (this.requestTimestamps.length < this.maxRequestsPerMinute) {
      this.isThrottled = false
    }
  }

  public recordRequest(): void {
    this.requestTimestamps.push(Date.now())
    this.cleanOldTimestamps()

    // Check if we need to throttle
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      this.isThrottled = true
    }
  }

  public shouldThrottle(): boolean {
    this.cleanOldTimestamps()
    return this.isThrottled
  }

  public getRequestsInLastMinute(): number {
    this.cleanOldTimestamps()
    return this.requestTimestamps.length
  }

  public getTimeUntilAvailable(): number {
    if (!this.isThrottled) return 0

    if (this.requestTimestamps.length === 0) return 0

    // Find the oldest timestamp that will put us below the limit
    const oldestRelevantTimestamp = this.requestTimestamps[this.requestTimestamps.length - this.maxRequestsPerMinute]

    if (!oldestRelevantTimestamp) return 0

    const now = Date.now()
    const timeUntilAvailable = Math.max(0, this.throttleDuration - (now - oldestRelevantTimestamp))

    return timeUntilAvailable
  }
}

export const apiThrottler = ApiThrottler.getInstance()

/**
 * Wrapper function to retry an API call with backoff if it fails due to rate limiting
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  backoffMs = 1000,
  shouldSimulate = false,
): Promise<T> {
  try {
    // Check if we're throttled before making the request
    if (apiThrottler.shouldThrottle() && !shouldSimulate) {
      const waitTime = apiThrottler.getTimeUntilAvailable()
      console.log(`API throttled. Waiting ${Math.ceil(waitTime / 1000)}s before retry.`)

      // Wait for the throttle period to end
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    // Record this request
    apiThrottler.recordRequest()

    // Make the actual API call
    return await fn()
  } catch (error: any) {
    // If we have retries left and this is a rate limit error, retry
    if (retries > 0 && (error.status === 429 || error.message?.includes("rate limit"))) {
      console.log(`Rate limit hit. Retrying in ${backoffMs / 1000}s... (${retries} retries left)`)

      // Wait for the backoff period
      await new Promise((resolve) => setTimeout(resolve, backoffMs))

      // Retry with exponential backoff
      return withRetry(fn, retries - 1, backoffMs * 2, shouldSimulate)
    }

    // If we're out of retries or it's not a rate limit error, rethrow
    throw error
  }
}
