import { getSectorMacroeconomicData, type SectorMacroeconomicData } from "./sector-macroeconomic-service"
import { generateSectorAwarePrediction } from "./sector-aware-prediction-service"
import { getStockData } from "./stock-service"
import type { SectorType } from "./sector-classification"

/**
 * Interface pour les données de comparaison sectorielle
 */
export interface SectorComparisonData {
  sector: SectorType
  sectorName: string
  macroOutlook: "bullish" | "bearish" | "neutral"
  outlookStrength: number
  keyIndicators: Array<{
    name: string
    value: number
    impact: "positive" | "negative" | "neutral"
  }>
  representativeStocks: Array<{
    symbol: string
    name: string
    price: number
    trend: "up" | "down" | "neutral"
    shortTermTarget?: number
    longTermTarget?: number
    percentChange?: number
  }>
  overallScore: number // Score global de -100 à 100
  riskLevel: "low" | "medium" | "high"
  growthPotential: "low" | "medium" | "high"
  keyThemes: string[]
  keyRisks: string[]
}

/**
 * Symboles représentatifs par secteur
 */
const representativeSymbols: Record<SectorType, string[]> = {
  technology: ["AAPL", "MSFT", "NVDA", "GOOGL", "META"],
  healthcare: ["JNJ", "PFE", "UNH", "MRK", "ABBV"],
  financial: ["JPM", "BAC", "GS", "MS", "V"],
  consumer: ["WMT", "PG", "KO", "MCD", "AMZN"],
  industrial: ["BA", "CAT", "GE", "HON", "MMM"],
  energy: ["XOM", "CVX", "COP", "SLB", "BP"],
  utilities: ["NEE", "DUK", "SO", "D", "AEP"],
  materials: ["LIN", "APD", "DD", "NEM", "FCX"],
  communication: ["T", "VZ", "CMCSA", "DIS", "NFLX"],
  real_estate: ["AMT", "PLD", "CCI", "SPG", "EQIX"],
  unknown: ["SPY", "QQQ", "DIA", "IWM", "VTI"],
}

/**
 * Récupère les données de comparaison pour un secteur spécifique
 * @param sector Type de secteur
 * @param country Pays (par défaut: US)
 * @returns Données de comparaison sectorielle
 */
export async function getSectorComparisonData(sector: SectorType, country = "US"): Promise<SectorComparisonData> {
  try {
    // Récupérer les données macroéconomiques du secteur
    const macroData = await getSectorMacroeconomicData(sector, country)

    // Récupérer les symboles représentatifs pour ce secteur
    const symbols = representativeSymbols[sector] || representativeSymbols.unknown

    // Récupérer les données et prédictions pour les actions représentatives
    const representativeStocks = await Promise.all(
      symbols.slice(0, 3).map(async (symbol) => {
        try {
          // Récupérer les données de l'action
          const stockData = await getStockData(symbol)

          // Générer une prédiction pour cette action
          const prediction = await generateSectorAwarePrediction(
            symbol,
            stockData.name,
            stockData.price,
            stockData.history,
          )

          // Calculer le changement en pourcentage
          const percentChange =
            prediction.longTermTarget && stockData.price
              ? ((prediction.longTermTarget - stockData.price) / stockData.price) * 100
              : undefined

          return {
            symbol,
            name: stockData.name,
            price: stockData.price,
            trend: prediction.trend,
            shortTermTarget: prediction.shortTermTarget,
            longTermTarget: prediction.longTermTarget,
            percentChange,
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
          return {
            symbol,
            name: symbol,
            price: 0,
            trend: "neutral" as const,
          }
        }
      }),
    )

    // Extraire les indicateurs clés
    const keyIndicators = macroData.indicators.slice(0, 3).map((indicator) => ({
      name: indicator.name,
      value: indicator.value,
      impact: indicator.sectorImpact,
    }))

    // Calculer le score global
    const overallScore = calculateOverallScore(macroData, representativeStocks)

    // Déterminer le niveau de risque
    const riskLevel = determineRiskLevel(macroData, overallScore)

    // Déterminer le potentiel de croissance
    const growthPotential = determineGrowthPotential(macroData, representativeStocks, overallScore)

    return {
      sector,
      sectorName: getSectorName(sector),
      macroOutlook: macroData.sectorOutlook,
      outlookStrength: macroData.outlookStrength,
      keyIndicators,
      representativeStocks,
      overallScore,
      riskLevel,
      growthPotential,
      keyThemes: macroData.keyThemes.slice(0, 3),
      keyRisks: macroData.riskFactors.slice(0, 3),
    }
  } catch (error) {
    console.error(`Error in sector comparison for ${sector}:`, error)
    throw new Error(
      `Failed to generate sector comparison data: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Récupère les données de comparaison pour plusieurs secteurs
 * @param sectors Liste des secteurs à comparer
 * @param country Pays (par défaut: US)
 * @returns Données de comparaison pour chaque secteur
 */
export async function compareMultipleSectors(sectors: SectorType[], country = "US"): Promise<SectorComparisonData[]> {
  try {
    // Récupérer les données pour chaque secteur en parallèle
    const sectorDataPromises = sectors.map((sector) => getSectorComparisonData(sector, country))
    const sectorData = await Promise.all(sectorDataPromises)

    // Trier les secteurs par score global (du plus élevé au plus bas)
    return sectorData.sort((a, b) => b.overallScore - a.overallScore)
  } catch (error) {
    console.error("Error comparing multiple sectors:", error)
    throw new Error(`Failed to compare sectors: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Calcule un score global pour un secteur
 * @param macroData Données macroéconomiques du secteur
 * @param stocks Actions représentatives du secteur
 * @returns Score global (-100 à 100)
 */
function calculateOverallScore(
  macroData: SectorMacroeconomicData,
  stocks: Array<{
    trend: "up" | "down" | "neutral"
    percentChange?: number
  }>,
): number {
  // Pondération des facteurs
  const macroWeight = 0.6
  const stocksWeight = 0.4

  // Score macroéconomique (-1 à 1)
  let macroScore = 0
  if (macroData.sectorOutlook === "bullish") {
    macroScore = macroData.outlookStrength
  } else if (macroData.sectorOutlook === "bearish") {
    macroScore = -macroData.outlookStrength
  }

  // Score des actions (-1 à 1)
  let stocksScore = 0
  let stocksCount = 0

  for (const stock of stocks) {
    if (stock.percentChange !== undefined) {
      // Normaliser le pourcentage de changement à une échelle de -1 à 1
      // Considérer qu'un changement de +/-30% est le maximum
      const normalizedChange = Math.max(-1, Math.min(1, stock.percentChange / 30))
      stocksScore += normalizedChange
      stocksCount++
    } else if (stock.trend !== "neutral") {
      // Si nous n'avons pas de pourcentage mais une tendance, utiliser une valeur par défaut
      stocksScore += stock.trend === "up" ? 0.5 : -0.5
      stocksCount++
    }
  }

  // Moyenne des scores des actions
  const avgStocksScore = stocksCount > 0 ? stocksScore / stocksCount : 0

  // Score combiné (-1 à 1)
  const combinedScore = macroScore * macroWeight + avgStocksScore * stocksWeight

  // Convertir à l'échelle -100 à 100 et arrondir
  return Math.round(combinedScore * 100)
}

/**
 * Détermine le niveau de risque d'un secteur
 * @param macroData Données macroéconomiques du secteur
 * @param overallScore Score global du secteur
 * @returns Niveau de risque
 */
function determineRiskLevel(macroData: SectorMacroeconomicData, overallScore: number): "low" | "medium" | "high" {
  // Facteurs de risque
  const negativeIndicatorsCount = macroData.indicators.filter((i) => i.sectorImpact === "negative").length
  const volatilityIndicator = macroData.indicators.find((i) => i.name.includes("Volatilité"))
  const volatilityFactor = volatilityIndicator ? volatilityIndicator.value / 10 : 0.5

  // Score de risque (0-1)
  const riskScore =
    0.4 * (1 - (overallScore + 100) / 200) + // Plus le score est bas, plus le risque est élevé
    0.4 * (negativeIndicatorsCount / Math.max(1, macroData.indicators.length)) + // Proportion d'indicateurs négatifs
    0.2 * volatilityFactor // Facteur de volatilité

  // Déterminer le niveau de risque
  if (riskScore < 0.4) return "low"
  if (riskScore < 0.7) return "medium"
  return "high"
}

/**
 * Détermine le potentiel de croissance d'un secteur
 * @param macroData Données macroéconomiques du secteur
 * @param stocks Actions représentatives du secteur
 * @param overallScore Score global du secteur
 * @returns Potentiel de croissance
 */
function determineGrowthPotential(
  macroData: SectorMacroeconomicData,
  stocks: Array<{
    percentChange?: number
  }>,
  overallScore: number,
): "low" | "medium" | "high" {
  // Facteurs de croissance
  const positiveIndicatorsCount = macroData.indicators.filter((i) => i.sectorImpact === "positive").length
  const averagePercentChange =
    stocks.reduce((sum, stock) => sum + (stock.percentChange || 0), 0) / Math.max(1, stocks.length)

  // Score de croissance (0-1)
  const growthScore =
    0.4 * ((overallScore + 100) / 200) + // Plus le score est élevé, plus le potentiel est élevé
    0.4 * (positiveIndicatorsCount / Math.max(1, macroData.indicators.length)) + // Proportion d'indicateurs positifs
    0.2 * (Math.max(0, averagePercentChange) / 30) // Potentiel de hausse moyen (plafonné à 30%)

  // Déterminer le potentiel de croissance
  if (growthScore < 0.4) return "low"
  if (growthScore < 0.7) return "medium"
  return "high"
}

/**
 * Obtient le nom lisible d'un secteur
 */
function getSectorName(sector: SectorType): string {
  const sectorNames: Record<SectorType, string> = {
    technology: "Technologie",
    healthcare: "Santé",
    financial: "Finance",
    consumer: "Consommation",
    industrial: "Industrie",
    energy: "Énergie",
    utilities: "Services publics",
    materials: "Matériaux",
    communication: "Communication",
    real_estate: "Immobilier",
    unknown: "Inconnu",
  }

  return sectorNames[sector]
}

/**
 * Récupère tous les secteurs disponibles
 * @returns Liste des types de secteurs avec leurs noms
 */
export function getAllSectors(): Array<{ type: SectorType; name: string }> {
  return [
    { type: "technology", name: "Technologie" },
    { type: "healthcare", name: "Santé" },
    { type: "financial", name: "Finance" },
    { type: "consumer", name: "Consommation" },
    { type: "industrial", name: "Industrie" },
    { type: "energy", name: "Énergie" },
    { type: "utilities", name: "Services publics" },
    { type: "materials", name: "Matériaux" },
    { type: "communication", name: "Communication" },
    { type: "real_estate", name: "Immobilier" },
  ]
}
