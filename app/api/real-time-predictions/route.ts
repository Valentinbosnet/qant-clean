import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { popularStocks } from "@/lib/stock-service"
import { generateRealTimePrediction } from "@/lib/real-time-prediction"
import { apiQuota } from "@/lib/api-quota-manager"

// Cache for frequent requests
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 15000 // 15 seconds

export async function GET(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("app-session") || cookieStore.get("next-auth.session-token")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get request parameters
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const forceRefresh = searchParams.get("refresh") === "true"
    const allowSimulated = searchParams.get("allowSimulated") === "true"

    // If a specific symbol is requested
    if (symbol) {
      const now = Date.now()
      const cacheKey = `prediction_${symbol}`
      const cacheEntry = cache[cacheKey]

      // Return cached data if available and not forcing refresh
      if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
        return NextResponse.json(cacheEntry.data)
      }

      // Check API quota if not allowing simulated data
      if (!allowSimulated && !apiQuota.canMakeRequest()) {
        return NextResponse.json(
          {
            error: "API quota exceeded. Try again later or allow simulated data.",
            quotaInfo: apiQuota.getQuotaInfo(),
          },
          { status: 429 },
        )
      }

      try {
        // Generate prediction
        const prediction = await generateRealTimePrediction(symbol, allowSimulated, apiQuota)

        // Cache the result
        cache[cacheKey] = {
          data: prediction,
          timestamp: now,
        }

        return NextResponse.json(prediction)
      } catch (error) {
        console.error(`Error generating prediction for ${symbol}:`, error)
        return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
      }
    }
    // If no symbol specified, return predictions for popular stocks
    else {
      const now = Date.now()
      const cacheKey = "predictions_multiple"
      const cacheEntry = cache[cacheKey]

      // Return cached data if available and not forcing refresh
      if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
        return NextResponse.json(cacheEntry.data)
      }

      // Get a subset of popular stocks to avoid too many requests
      const symbols = popularStocks.slice(0, 3)

      // Check if we have enough API quota
      if (!allowSimulated && !apiQuota.reserveRequests(symbols.length)) {
        return NextResponse.json(
          {
            error: "API quota exceeded. Try again later or allow simulated data.",
            quotaInfo: apiQuota.getQuotaInfo(),
          },
          { status: 429 },
        )
      }

      try {
        // Generate predictions for multiple stocks
        const predictions = await Promise.all(
          symbols.map((symbol) => generateRealTimePrediction(symbol, allowSimulated, apiQuota)),
        )

        // Cache the results
        cache[cacheKey] = {
          data: predictions,
          timestamp: now,
        }

        return NextResponse.json(predictions)
      } catch (error) {
        console.error("Error generating multiple predictions:", error)
        return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Error in real-time predictions API:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
