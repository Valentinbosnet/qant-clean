import { type NextRequest, NextResponse } from "next/server"
import { sectorRotationBacktestService, predefinedStrategies } from "@/lib/sector-rotation-backtest-service"
import type { RotationStrategyConfig } from "@/lib/sector-rotation-backtest-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategies, startDate, endDate } = body

    if (!strategies || !Array.isArray(strategies) || strategies.length === 0) {
      return NextResponse.json({ error: "At least one strategy configuration is required" }, { status: 400 })
    }

    // Définir les dates par défaut si non spécifiées
    const defaultStartDate = "2018-01-01"
    const defaultEndDate = new Date().toISOString().split("T")[0]

    // Exécuter les backtests pour toutes les stratégies
    const results = await sectorRotationBacktestService.compareStrategies(
      strategies as RotationStrategyConfig[],
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in compare backtests API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "2018-01-01"
    const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0]

    // Par défaut, comparer toutes les stratégies prédéfinies
    const results = await sectorRotationBacktestService.compareStrategies(predefinedStrategies, startDate, endDate)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in compare backtests API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
