"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { StockCard } from "@/components/stock-card"
import { type StockData, getMultipleStocks, popularStocks, clearStockCache } from "@/lib/stock-service"
import { useStockModal } from "@/hooks/use-stock-modal"
import { SearchButton } from "@/components/search/search-button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Pause, Play, AlertTriangle, Info, Database, Trash } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { getCacheStats as getCacheStatistics } from "@/lib/cache-utils"

export function StockGrid() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [customStocks, setCustomStocks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 1 minute by default
  const [showCacheStats, setShowCacheStats] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [useCachedData, setUseCachedData] = useState(true)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { openModal } = useStockModal()
  const { toast } = useToast()

  // Listen for API rate limit events
  useEffect(() => {
    const handleRateLimit = () => {
      setIsRateLimited(true)
      setError("Alpha Vantage API rate limit reached (25 requests per day). Using cached data.")

      // Disable auto-refresh when rate limited
      setAutoRefresh(false)

      toast({
        title: "API Rate Limit Reached",
        description: "The free tier of Alpha Vantage only allows 25 requests per day. Using cached data.",
        variant: "destructive",
      })
    }

    window.addEventListener("api-rate-limit", handleRateLimit)

    return () => {
      window.removeEventListener("api-rate-limit", handleRateLimit)
    }
  }, [toast])

  // Load custom stocks from localStorage on initial render
  useEffect(() => {
    const savedStocks = localStorage.getItem("customStocks")
    if (savedStocks) {
      try {
        setCustomStocks(JSON.parse(savedStocks))
      } catch (e) {
        console.error("Error parsing saved stocks:", e)
      }
    }
  }, [])

  // Load stocks whenever customStocks changes
  useEffect(() => {
    loadStocks()
    // Save custom stocks to localStorage whenever they change
    localStorage.setItem("customStocks", JSON.stringify(customStocks))
  }, [customStocks])

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && !isRateLimited) {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }

      // Set up new timer
      refreshTimerRef.current = setInterval(() => {
        loadStocks(false) // Don't show loading indicator for auto-refresh
      }, refreshInterval)

      // Clean up on unmount or when autoRefresh changes
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current)
        }
      }
    } else if (refreshTimerRef.current) {
      // If auto-refresh is turned off, clear the timer
      clearInterval(refreshTimerRef.current)
    }
  }, [autoRefresh, refreshInterval, isRateLimited])

  // Update cache stats periodically
  useEffect(() => {
    const updateCacheStats = () => {
      if (typeof window !== "undefined") {
        try {
          setCacheStats(getCacheStatistics())
        } catch (e) {
          console.error("Error getting cache stats:", e)
        }
      }
    }

    updateCacheStats()
    const interval = setInterval(updateCacheStats, 30000)

    return () => clearInterval(interval)
  }, [])

  async function loadStocks(showLoading = true, forceRefresh = false) {
    if (isRateLimited && forceRefresh) {
      toast({
        title: "API Rate Limit Reached",
        description: "Cannot refresh data due to API rate limit. Try again tomorrow or use cached data.",
        variant: "destructive",
      })
      return
    }

    if (showLoading) {
      setLoading(true)
    }
    setError(null)

    try {
      // Combine popular stocks with custom stocks, removing duplicates
      const allStockSymbols = Array.from(new Set([...popularStocks, ...customStocks]))

      // Add a timeout to prevent hanging requests
      const stockDataPromise = getMultipleStocks(allStockSymbols, forceRefresh && !useCachedData)
      const timeoutPromise = new Promise<StockData[]>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000)
      })

      // Race the stock data promise against the timeout
      const stockData = await Promise.race([stockDataPromise, timeoutPromise])

      setStocks(stockData)
      setLastUpdated(new Date())

      // Update cache stats after loading
      if (typeof window !== "undefined") {
        setCacheStats(getCacheStatistics())
      }
    } catch (error: any) {
      console.error("Error loading stocks:", error)

      // Check if the error is related to rate limiting
      if (error.message && error.message.includes("rate limit")) {
        setIsRateLimited(true)
        setError("Alpha Vantage API rate limit reached (25 requests per day). Using cached data.")
        setAutoRefresh(false)
      } else {
        setError("Failed to load stock data. Using cached or fallback data.")
      }

      // Don't show toast for auto-refresh errors to avoid spamming the user
      if (showLoading) {
        toast({
          title: "Error loading stocks",
          description: "There was a problem loading stock data. Using cached data where available.",
          variant: "destructive",
        })
      }

      // If we have existing stocks, keep them instead of showing an error state
      if (stocks.length === 0) {
        // Generate fallback data for popular stocks
        const fallbackStocks = popularStocks.map((symbol) => ({
          symbol,
          name: symbol,
          price: 100 + Math.random() * 900,
          change: Math.random() * 20 - 10,
          percentChange: Math.random() * 5 - 2.5,
          history: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
            price: 100 + Math.random() * 50,
          })),
        }))
        setStocks(fallbackStocks)
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const handleRefresh = (forceRefresh = false) => {
    if (isRateLimited && forceRefresh) {
      toast({
        title: "API Rate Limit Reached",
        description: "Cannot refresh data due to API rate limit. Try again tomorrow or use cached data.",
        variant: "destructive",
      })
      return
    }
    loadStocks(true, forceRefresh) // Show loading indicator for manual refresh
  }

  const handleViewDetails = (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol)
    if (stock) {
      openModal(stock)
    }
  }

  const handleAddStock = (symbol: string) => {
    // Check if stock already exists
    if ([...popularStocks, ...customStocks].includes(symbol)) {
      toast({
        title: "Stock already added",
        description: `${symbol} is already on your dashboard`,
      })
      return
    }

    // Add the stock to custom stocks
    setCustomStocks((prev) => [...prev, symbol])
  }

  const handleRemoveStock = (symbol: string) => {
    // Only allow removing custom stocks, not popular ones
    if (popularStocks.includes(symbol)) {
      toast({
        title: "Cannot remove default stock",
        description: "Default stocks cannot be removed from the dashboard",
      })
      return
    }

    setCustomStocks((prev) => prev.filter((s) => s !== symbol))
    toast({
      title: "Stock removed",
      description: `${symbol} has been removed from your dashboard`,
    })
  }

  const toggleAutoRefresh = () => {
    if (isRateLimited && !autoRefresh) {
      toast({
        title: "Auto-refresh disabled",
        description: "Cannot enable auto-refresh due to API rate limit.",
        variant: "destructive",
      })
      return
    }
    setAutoRefresh(!autoRefresh)
  }

  const handleClearCache = () => {
    clearStockCache()
    toast({
      title: "Cache Cleared",
      description: "All cached stock data has been cleared.",
    })
    setCacheStats(getCacheStatistics())
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div>
      {isRateLimited && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Rate Limit Reached</AlertTitle>
          <AlertDescription>
            The free tier of Alpha Vantage only allows 25 requests per day. Using cached data until the limit resets.
            <br />
            <a
              href="https://www.alphavantage.co/premium/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Subscribe to a premium plan
            </a>{" "}
            to remove this limitation.
          </AlertDescription>
        </Alert>
      )}

      {error && !isRateLimited && (
        <Alert variant="warning" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>API Warning</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stock data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {stocks.length > 0 && stocks[0].cachedAt && (
                  <span className="ml-1">{stocks[0].cachedAt > Date.now() - 60000 ? "(live)" : "(cached)"}</span>
                )}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRefresh(false)}
                className="h-8 w-8"
                disabled={isRateLimited}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={toggleAutoRefresh}
                  disabled={isRateLimited}
                />
                <Label htmlFor="auto-refresh" className="text-sm">
                  Auto-refresh{" "}
                  {autoRefresh ? <Pause className="h-3 w-3 inline" /> : <Play className="h-3 w-3 inline" />}
                </Label>
              </div>

              <select
                className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh || isRateLimited}
              >
                <option value="30000">30s</option>
                <option value="60000">1m</option>
                <option value="300000">5m</option>
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <SearchButton onAddStock={handleAddStock} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Database className="h-4 w-4" />
                    <span>Cache</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Cache Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowCacheStats(true)}>View Cache Statistics</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearCache}>
                    <Trash className="h-4 w-4 mr-2 text-destructive" />
                    Clear Cache
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm">
                    <div className="flex items-center space-x-2">
                      <Switch id="use-cache" checked={useCachedData} onCheckedChange={setUseCachedData} />
                      <Label htmlFor="use-cache">Use cached data</Label>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => handleRefresh(true)}
                className="w-full sm:w-auto"
                disabled={isRateLimited}
                variant={useCachedData ? "default" : "secondary"}
              >
                {useCachedData ? "Refresh" : "Force Refresh"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onViewDetails={handleViewDetails}
                isRemovable={!popularStocks.includes(stock.symbol)}
                onRemove={handleRemoveStock}
              />
            ))}
          </div>
        </>
      )}

      {/* Cache Statistics Dialog */}
      <Dialog open={showCacheStats} onOpenChange={setShowCacheStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cache Statistics</DialogTitle>
            <DialogDescription>Information about locally cached stock data</DialogDescription>
          </DialogHeader>

          {cacheStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Cached Items</h3>
                  <p className="text-2xl font-bold">{cacheStats.itemCount}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Size</h3>
                  <p className="text-2xl font-bold">{formatBytes(cacheStats.totalSize)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Cache Age</h3>
                <div className="text-sm">
                  <p>Oldest item: {cacheStats.oldestItem ? new Date(cacheStats.oldestItem).toLocaleString() : "N/A"}</p>
                  <p>Newest item: {cacheStats.newestItem ? new Date(cacheStats.newestItem).toLocaleString() : "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Cache Status</h3>
                <div className="text-sm">
                  <p>{cacheStats.itemCount > 0 ? "Cache is active and helping reduce API calls" : "Cache is empty"}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCacheStats(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleClearCache}>
              Clear Cache
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
