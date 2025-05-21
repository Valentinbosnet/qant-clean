import { type NextRequest, NextResponse } from "next/server"
import { getMarketHighlights } from "@/lib/market-highlights-service"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "3", 10)

    // Récupérer les faits saillants du marché
    const highlights = await getMarketHighlights(limit)

    return NextResponse.json(highlights)
  } catch (error) {
    console.error("Erreur lors de la récupération des faits saillants du marché:", error)
    return NextResponse.json({ error: "Impossible de récupérer les faits saillants du marché" }, { status: 500 })
  }
}
