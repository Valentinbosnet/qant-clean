import { type NextRequest, NextResponse } from "next/server"
import { getSectorMacroeconomicData } from "@/lib/sector-macroeconomic-service"
import type { SectorType } from "@/lib/sector-classification"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const sector = searchParams.get("sector") as SectorType | null
    const country = searchParams.get("country") || "US"
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!sector) {
      return NextResponse.json({ error: "Sector parameter is required" }, { status: 400 })
    }

    // Récupérer les données macroéconomiques sectorielles
    const macroData = await getSectorMacroeconomicData(sector, country, forceRefresh)

    return NextResponse.json(macroData)
  } catch (error) {
    console.error("Error in sector macroeconomic API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
