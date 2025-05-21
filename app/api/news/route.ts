import { type NextRequest, NextResponse } from "next/server"
import { getNews } from "@/lib/news-service"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || "business"
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    // Récupérer les actualités
    const news = await getNews(category, limit)

    return NextResponse.json(news)
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités:", error)
    return NextResponse.json({ error: "Impossible de récupérer les actualités" }, { status: 500 })
  }
}
