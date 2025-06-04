import { isOfflineModeEnabled } from "@/lib/offline-mode"

// Types pour les faits saillants du marché
export interface StockHighlight {
  symbol: string
  name: string
  price: number
  change?: number
  changePercent: number
  volume?: string
}

export interface MarketHighlights {
  topGainers: StockHighlight[]
  topLosers: StockHighlight[]
  mostActive: StockHighlight[]
}

// Liste des actions populaires pour les données de secours
const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "INTC", name: "Intel Corp." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "PYPL", name: "PayPal Holdings" },
  { symbol: "DIS", name: "Walt Disney Co." },
  { symbol: "CSCO", name: "Cisco Systems" },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CMCSA", name: "Comcast Corp." },
]

// Fonction pour récupérer les faits saillants du marché
export async function getMarketHighlights(limit = 3): Promise<MarketHighlights> {
  // Vérifier si le mode hors ligne est activé
  if (isOfflineModeEnabled()) {
    return getMockMarketHighlights(limit)
  }

  try {
    // Utiliser notre API route au lieu d'appeler directement Alpha Vantage
    const response = await fetch(`/api/market/highlights?limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des faits saillants: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la récupération des faits saillants du marché:", error)
    return getMockMarketHighlights(limit)
  }
}

// Fonction pour formater le volume
function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  } else {
    return volume.toString()
  }
}

// Fonction pour obtenir des faits saillants du marché fictifs
function getMockMarketHighlights(limit: number): MarketHighlights {
  // Générer des données aléatoires pour les actions
  const generateRandomStocks = (count: number, isGainer = true): StockHighlight[] => {
    const stocks = []
    const usedIndices = new Set()

    for (let i = 0; i < count; i++) {
      // Sélectionner une action aléatoire qui n'a pas encore été utilisée
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * popularStocks.length)
      } while (usedIndices.has(randomIndex))

      usedIndices.add(randomIndex)
      const stock = popularStocks[randomIndex]

      // Générer un prix aléatoire entre 50 et 500
      const price = Math.random() * 450 + 50

      // Générer un pourcentage de changement aléatoire
      const changePercent = isGainer
        ? Math.random() * 5 + 1 // Entre 1% et 6% pour les gagnants
        : -(Math.random() * 5 + 1) // Entre -1% et -6% pour les perdants

      // Calculer le changement absolu
      const change = price * (changePercent / 100)

      // Générer un volume aléatoire
      const volumeValue = Math.floor(Math.random() * 100000000) + 1000000
      const volume = formatVolume(volumeValue)

      stocks.push({
        symbol: stock.symbol,
        name: stock.name,
        price,
        change,
        changePercent,
        volume,
      })
    }

    return stocks
  }

  // Générer les top gagnants
  const topGainers = generateRandomStocks(limit, true)

  // Générer les top perdants
  const topLosers = generateRandomStocks(limit, false)

  // Générer les plus actifs (mélange de gagnants et perdants)
  const mostActive = []
  const usedIndices = new Set()

  for (let i = 0; i < limit; i++) {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * popularStocks.length)
    } while (usedIndices.has(randomIndex))

    usedIndices.add(randomIndex)
    const stock = popularStocks[randomIndex]

    const price = Math.random() * 450 + 50
    const changePercent = Math.random() > 0.5 ? Math.random() * 3 + 0.5 : -(Math.random() * 3 + 0.5)
    const change = price * (changePercent / 100)

    // Volume plus élevé pour les plus actifs
    const volumeValue = Math.floor(Math.random() * 500000000) + 50000000
    const volume = formatVolume(volumeValue)

    mostActive.push({
      symbol: stock.symbol,
      name: stock.name,
      price,
      change,
      changePercent,
      volume,
    })
  }

  return {
    topGainers,
    topLosers,
    mostActive,
  }
}
