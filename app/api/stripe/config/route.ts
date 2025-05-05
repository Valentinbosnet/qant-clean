import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Vérifier que les variables d'environnement nécessaires sont définies
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID

    const missingVars = []
    if (!publishableKey) missingVars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
    if (!premiumPriceId) missingVars.push("STRIPE_PREMIUM_PRICE_ID")
    if (!proPriceId) missingVars.push("STRIPE_PRO_PRICE_ID")

    if (missingVars.length > 0) {
      console.error(`Variables d'environnement Stripe manquantes: ${missingVars.join(", ")}`)
      return NextResponse.json(
        {
          error: "Configuration Stripe incomplète",
          missingVars,
        },
        { status: 500 },
      )
    }

    // Retourner la configuration Stripe
    return NextResponse.json({
      publishableKey,
      premiumPriceId,
      proPriceId,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration Stripe:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la configuration Stripe",
      },
      { status: 500 },
    )
  }
}
