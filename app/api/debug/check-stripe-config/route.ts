import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Vérifier les variables d'environnement Stripe
    const stripeConfig = {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) + "..." : null,
      hasPremiumPriceId: !!process.env.STRIPE_PREMIUM_PRICE_ID,
      premiumPriceIdValue: process.env.STRIPE_PREMIUM_PRICE_ID,
      hasProPriceId: !!process.env.STRIPE_PRO_PRICE_ID,
      proPriceIdValue: process.env.STRIPE_PRO_PRICE_ID,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.length : 0,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }

    return NextResponse.json(stripeConfig)
  } catch (error) {
    console.error("Erreur lors de la vérification de la configuration Stripe:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
