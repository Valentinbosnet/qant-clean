import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Return pricing information
    const pricing = {
      plans: [
        {
          id: "free",
          name: "Free",
          price: 0,
          features: ["Accès limité aux prédictions", "Données historiques basiques", "1 portefeuille virtuel"],
        },
        {
          id: "premium",
          name: "Premium",
          price: 9.99,
          features: [
            "Prédictions illimitées",
            "Analyse technique avancée",
            "5 portefeuilles virtuels",
            "Alertes personnalisées",
          ],
          popular: true,
        },
        {
          id: "pro",
          name: "Pro",
          price: 19.99,
          features: [
            "Tout ce qui est inclus dans Premium",
            "Analyse prédictive en temps réel",
            "Portefeuilles virtuels illimités",
            "Support prioritaire",
            "API d'accès aux données",
          ],
        },
      ],
    }

    return NextResponse.json(pricing)
  } catch (error) {
    console.error("Error fetching pricing information:", error)
    return NextResponse.json({ error: "Failed to fetch pricing information" }, { status: 500 })
  }
}
