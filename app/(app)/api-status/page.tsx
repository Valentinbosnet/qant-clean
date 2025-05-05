"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Check, AlertTriangle, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ApiStatusPage() {
  const [quotaInfo, setQuotaInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchQuotaInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/quota-info")
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      const data = await response.json()
      setQuotaInfo(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching quota info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotaInfo()

    // Set up auto-refresh
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchQuotaInfo()
      }, 10000) // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const handleRefresh = () => {
    fetchQuotaInfo()
  }

  const getTimeRemaining = (date: string) => {
    const remainingMs = new Date(date).getTime() - Date.now()
    if (remainingMs <= 0) return "0s"

    const seconds = Math.floor((remainingMs / 1000) % 60)
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60)

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">API Status & Quota Dashboard</h1>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
        </div>
        {lastUpdate && (
          <div className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>API Quota Status</CardTitle>
              {quotaInfo && (
                <Badge variant={quotaInfo.canMakeRequest ? "outline" : "destructive"}>
                  {quotaInfo.canMakeRequest ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Available
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" /> Limited
                    </>
                  )}
                </Badge>
              )}
            </div>
            <CardDescription>Alpha Vantage API quota usage and limitations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !quotaInfo ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : quotaInfo ? (
              <div className="space-y-6">
                <div>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Minute Quota</span>
                      <span className="text-sm font-medium">
                        {quotaInfo.requestsThisMinute}/{quotaInfo.minuteLimit}
                      </span>
                    </div>
                    <Progress value={(quotaInfo.requestsThisMinute / quotaInfo.minuteLimit) * 100} className="h-2" />
                    {quotaInfo.requestsThisMinute > 0 && (
                      <div className="flex justify-end mt-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Resets in {getTimeRemaining(quotaInfo.minuteResetTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Daily Quota</span>
                      <span className="text-sm font-medium">
                        {quotaInfo.requestsToday}/{quotaInfo.dailyLimit}
                      </span>
                    </div>
                    <Progress value={(quotaInfo.requestsToday / quotaInfo.dailyLimit) * 100} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Optimizing Your API Usage</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Use simulated data when real-time data isn't critical</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Cache API responses for frequently accessed data</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Batch API requests whenever possible</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">Unable to fetch quota information</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Best Practices</CardTitle>
            <CardDescription>Guidelines for working with rate-limited APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Implement Progressive Loading</h3>
                <p className="text-sm text-muted-foreground">
                  Show simulated or cached data immediately, then update with real data when available. This provides a
                  smooth user experience despite API limitations.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Use Exponential Backoff</h3>
                <p className="text-sm text-muted-foreground">
                  When rate limits are hit, wait increasingly longer between retry attempts. This prevents overwhelming
                  the API with requests during high traffic.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Implement Smart Caching</h3>
                <p className="text-sm text-muted-foreground">
                  Cache responses with appropriate TTLs based on how frequently the data changes. Prioritize real-time
                  data only for critical information.
                </p>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">API Usage Guidelines</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Alpha Vantage Free Tier: 5 requests/minute, 500/day</li>
                  <li>• Premium plans available for higher limits</li>
                  <li>• Consider implementing a queue for non-urgent requests</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
