import { type NextRequest, NextResponse } from "next/server"
import { getPremiumStockQuote, getComprehensiveTechnicalData } from "@/lib/enhanced-stock-service"
import { ALPHA_VANTAGE_CONFIG as AV_CONFIG } from "@/lib/alpha-vantage-config"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")
    const action = searchParams.get("action") || "quote"
    const interval = searchParams.get("interval") || AV_CONFIG.INTERVALS.DAILY
    const refresh = searchParams.get("refresh") === "true"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    // Validation de l'intervalle
    if (!Object.values(AV_CONFIG.INTERVALS).includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Must be one of: ${Object.values(AV_CONFIG.INTERVALS).join(", ")}` },
        { status: 400 },
      )
    }

    let result

    switch (action) {
      case "quote":
        result = await getPremiumStockQuote(symbol)
        break

      case "technical":
        result = await getComprehensiveTechnicalData(symbol, interval)
        break

      // Ajoutez d'autres actions selon vos besoins

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    // Ajouter des métadonnées sur l'API
    const response = {
      ...result,
      _meta: {
        apiProvider: "Alpha Vantage Premium",
        timestamp: new Date().toISOString(),
        requestParams: {
          symbol,
          action,
          interval,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[API ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch stock data", details: String(error) }, { status: 500 })
  }
}
