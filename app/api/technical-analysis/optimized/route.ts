import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getComprehensiveTechnicalData } from "@/lib/enhanced-stock-service"

export async function GET(request: NextRequest) {
  try {
    // Obtenir la session actuelle pour authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")
    const forceRefresh = searchParams.get("refresh") === "true"
    const allowSimulated = searchParams.get("allowSimulated") !== "false" // Par défaut, autorise les données simulées

    if (!symbol) {
      return NextResponse.json({ error: "Le paramètre symbol est requis" }, { status: 400 })
    }

    try {
      const technicalData = await getComprehensiveTechnicalData(symbol, undefined, forceRefresh, allowSimulated)
      return NextResponse.json(technicalData)
    } catch (error) {
      console.error("Erreur lors de l'analyse technique:", error)
      return NextResponse.json(
        {
          error: "Erreur lors de l'analyse technique",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    )
  }
}
