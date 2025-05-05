import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Version simplifiée qui retourne toujours des données fictives
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol") || "AAPL"

    const mockPrediction = {
      symbol,
      name: `${symbol} Inc.`,
      currentPrice: Math.round((50 + Math.random() * 450) * 100) / 100,
      prediction: Math.random() > 0.5 ? "Hausse attendue" : "Baisse probable",
      confidence: Math.round((60 + Math.random() * 35) * 10) / 10,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(mockPrediction)
  } catch (error) {
    console.error("Error in API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
