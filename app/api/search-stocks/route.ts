import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Liste des indices populaires pour la recherche
const popularIndices = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "HD", name: "Home Depot Inc." },
  { symbol: "BAC", name: "Bank of America Corp." },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CRM", name: "Salesforce, Inc." },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "VZ", name: "Verizon Communications Inc." },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "MRK", name: "Merck & Co., Inc." },
  { symbol: "CMCSA", name: "Comcast Corporation" },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "ABT", name: "Abbott Laboratories" },
  { symbol: "NKE", name: "Nike, Inc." },
  { symbol: "ABBV", name: "AbbVie Inc." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "ACN", name: "Accenture plc" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc." },
  { symbol: "COST", name: "Costco Wholesale Corporation" },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "LLY", name: "Eli Lilly and Company" },
]

export async function GET(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Requête de recherche manquante" }, { status: 400 })
    }

    // Recherche locale dans la liste des indices populaires
    const results = popularIndices.filter(
      (index) =>
        index.symbol.toLowerCase().includes(query.toLowerCase()) ||
        index.name.toLowerCase().includes(query.toLowerCase()),
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Erreur lors de la recherche d'indices:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
