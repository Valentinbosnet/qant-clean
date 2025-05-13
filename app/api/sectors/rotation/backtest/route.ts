import { type NextRequest, NextResponse } from "next/server"
import { sectorRotationBacktestService, predefinedStrategies } from "@/lib/sector-rotation-backtest-service"
import type { RotationStrategyConfig } from "@/lib/sector-rotation-backtest-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategy, startDate, endDate } = body

    if (!strategy) {
      return NextResponse.json({ error: "Strategy configuration is required" }, { status: 400 })
    }

    // Définir les dates par défaut si non spécifiées
    const defaultStartDate = "2018-01-01"
    const defaultEndDate = new Date().toISOString().split("T")[0]

    // Exécuter le backtest avec la stratégie fournie
    const result = await sectorRotationBacktestService.runBacktest(
      strategy as RotationStrategyConfig,
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in backtest API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const strategyIndex = Number.parseInt(searchParams.get("strategy") || "0", 10)
    const startDate = searchParams.get("startDate") || "2018-01-01"
    const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0]

    // Sélectionner la stratégie prédéfinie ou utiliser la première par défaut
    const strategy = predefinedStrategies[strategyIndex] || predefinedStrategies[0]

    // Exécuter le backtest
    const result = await sectorRotationBacktestService.runBacktest(strategy, startDate, endDate)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in backtest API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
