import { type NextRequest, NextResponse } from "next/server"
import { compareMultipleSectors } from "@/lib/sector-comparison-service"
import type { SectorType } from "@/lib/sector-classification"

export async function POST(request: NextRequest) {
  try {
    // Récupérer les secteurs à comparer depuis le corps de la requête
    const { sectors, country } = await request.json()

    if (!sectors || !Array.isArray(sectors) || sectors.length === 0) {
      return NextResponse.json({ error: "Sectors array is required" }, { status: 400 })
    }

    // Limiter le nombre de secteurs à comparer pour éviter les abus
    const limitedSectors = sectors.slice(0, 5) as SectorType[]

    // Récupérer les données de comparaison
    const comparisonData = await compareMultipleSectors(limitedSectors, country || "US")

    return NextResponse.json(comparisonData)
  } catch (error) {
    console.error("Error in sector comparison API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
