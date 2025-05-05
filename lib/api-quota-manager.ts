// Simple API quota manager to prevent exceeding rate limits
class ApiQuotaManager {
  private maxRequests = 5
  private requestsRemaining = 5
  private resetTime: number = Date.now() + 60000 // Reset after 1 minute

  constructor(maxRequests = 5) {
    this.maxRequests = maxRequests
    this.requestsRemaining = maxRequests
  }

  canMakeRequest(): boolean {
    this.checkReset()
    return this.requestsRemaining > 0
  }

  reserveRequests(count: number): boolean {
    this.checkReset()
    if (this.requestsRemaining >= count) {
      this.requestsRemaining -= count
      return true
    }
    return false
  }

  useRequest(): boolean {
    this.checkReset()
    if (this.requestsRemaining > 0) {
      this.requestsRemaining--
      return true
    }
    return false
  }

  getQuotaInfo() {
    this.checkReset()
    return {
      requestsRemaining: this.requestsRemaining,
      maxRequests: this.maxRequests,
      resetIn: Math.max(0, this.resetTime - Date.now()),
    }
  }

  private checkReset() {
    if (Date.now() > this.resetTime) {
      this.requestsRemaining = this.maxRequests
      this.resetTime = Date.now() + 60000 // Reset after 1 minute
    }
  }
}

// Export a singleton instance
export const apiQuota = new ApiQuotaManager()
