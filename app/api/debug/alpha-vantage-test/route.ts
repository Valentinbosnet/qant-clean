import { getStockQuote, getStockTimeSeries, getIntradayData, getSectorPerformance } from "@/actions/stock-api"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || "quote"
  const symbol = searchParams.get("symbol") || "AAPL"

  try {
    let data
    switch (endpoint) {
      case "quote":
        data = await getStockQuote(symbol)
        break
      case "daily":
        data = await getStockTimeSeries(symbol)
        break
      case "intraday":
        data = await getIntradayData(symbol)
        break
      case "sector":
        data = await getSectorPerformance()
        break
      default:
        return NextResponse.json({ error: "Endpoint non valide" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      endpoint,
      symbol: endpoint !== "sector" ? symbol : null,
      data,
    })
  } catch (error) {
    console.error(`Error testing Alpha Vantage API (${endpoint}):`, error)
    return NextResponse.json(
      {
        success: false,
        endpoint,
        symbol: endpoint !== "sector" ? symbol : null,
        error: error instanceof Error ? error.message : "Une erreur s'est produite",
      },
      { status: 500 },
    )
  }
}
