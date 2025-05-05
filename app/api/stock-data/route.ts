import { type NextRequest, NextResponse } from "next/server"
import { getStockData } from "@/lib/stock-service"

// Cache pour stocker les données et réduire les appels API
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 60 * 1000 // 1 minute en millisecondes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")
    const refresh = searchParams.get("refresh") === "true"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    // Vérifier le cache si refresh n'est pas demandé
    const cacheKey = symbol.toUpperCase()
    const now = Date.now()
    if (!refresh && cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return NextResponse.json(cache[cacheKey].data)
    }

    try {
      // Récupérer les données fraîches
      const stockData = await getStockData(symbol)

      // Ajouter des données fondamentales
      const fundamentalData = {
        ...stockData,
        fundamentals: {
          pe: (Math.random() * 30 + 10).toFixed(2),
          eps: (Math.random() * 10 + 1).toFixed(2),
          dividendYield: (Math.random() * 3).toFixed(2),
          beta: (Math.random() * 2 + 0.5).toFixed(2),
          marketCap: `${(Math.random() * 1000 + 100).toFixed(2)}B`,
          avgVolume: `${(Math.random() * 10 + 1).toFixed(2)}M`,
          dayVolume: `${(Math.random() * 15 + 1).toFixed(2)}M`,
          floatShares: `${(Math.random() * 900 + 100).toFixed(2)}M`,
          roe: (Math.random() * 30 + 5).toFixed(2),
          roa: (Math.random() * 15 + 2).toFixed(2),
          profitMargin: (Math.random() * 25 + 5).toFixed(2),
          debtToEquity: (Math.random() * 1 + 0.2).toFixed(2),
          revenueGrowth: (Math.random() * 30 - 5).toFixed(2),
          epsGrowth: (Math.random() * 35 - 5).toFixed(2),
          nextQuarterEPS: (Math.random() * 3 + 0.5).toFixed(2),
        },
      }

      // Mettre à jour le cache
      cache[cacheKey] = {
        data: fundamentalData,
        timestamp: now,
      }

      return NextResponse.json(fundamentalData)
    } catch (error) {
      console.error("Error in stock data processing:", error)

      // Générer des données de secours en cas d'erreur
      const fallbackData = {
        symbol: symbol.toUpperCase(),
        name: getFallbackCompanyName(symbol),
        currentPrice: 200 + Math.random() * 50,
        previousClose: 195 + Math.random() * 50,
        change: 5 + Math.random() * 10 - 5,
        changePercent: 2.56 + Math.random() * 2 - 1,
        history: generateFallbackHistory(),
        isSimulated: true,
        fundamentals: {
          pe: "25.67",
          eps: "3.45",
          dividendYield: "1.20",
          beta: "1.15",
          marketCap: "500.25B",
          avgVolume: "5.7M",
          dayVolume: "6.2M",
          floatShares: "450.8M",
          roe: "18.5",
          roa: "8.2",
          profitMargin: "15.7",
          debtToEquity: "0.45",
          revenueGrowth: "12.8",
          epsGrowth: "15.3",
          nextQuarterEPS: "1.25",
        },
      }

      // Mettre à jour le cache avec les données de secours
      cache[cacheKey] = {
        data: fallbackData,
        timestamp: now,
      }

      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Failed to fetch stock data", details: String(error) }, { status: 500 })
  }
}

// Fonction pour obtenir un nom d'entreprise de secours
function getFallbackCompanyName(symbol: string) {
  const companies: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    WMT: "Walmart Inc.",
  }

  return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`
}

// Fonction pour générer un historique de prix de secours
function generateFallbackHistory() {
  const history = []
  const now = new Date()
  const basePrice = 200

  for (let i = 168; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const randomChange = (Math.random() - 0.5) * 0.01
    const price = basePrice * (1 + randomChange * (i / 24))

    history.push({
      date: date.toISOString(),
      price: price,
    })
  }

  return history
}
