import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Clé API Stripe non configurée" }, { status: 500 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Tester la connexion à l'API Stripe
    const balance = await stripe.balance.retrieve()

    // Vérifier les IDs de prix
    const priceResults = {
      premium: null as any,
      pro: null as any,
    }

    // Vérifier l'ID de prix Premium
    if (process.env.STRIPE_PREMIUM_PRICE_ID) {
      try {
        priceResults.premium = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID)
      } catch (error) {
        priceResults.premium = {
          error: "ID de prix Premium invalide",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        }
      }
    } else {
      priceResults.premium = { error: "ID de prix Premium non configuré" }
    }

    // Vérifier l'ID de prix Pro
    if (process.env.STRIPE_PRO_PRICE_ID) {
      try {
        priceResults.pro = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID)
      } catch (error) {
        priceResults.pro = {
          error: "ID de prix Pro invalide",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        }
      }
    } else {
      priceResults.pro = { error: "ID de prix Pro non configuré" }
    }

    // Formater les résultats pour l'affichage
    const formattedPrices = {
      premium: priceResults.premium?.error
        ? priceResults.premium
        : {
            id: priceResults.premium?.id,
            active: priceResults.premium?.active,
            currency: priceResults.premium?.currency,
            unit_amount: priceResults.premium?.unit_amount,
            product: priceResults.premium?.product,
            type: priceResults.premium?.type,
          },
      pro: priceResults.pro?.error
        ? priceResults.pro
        : {
            id: priceResults.pro?.id,
            active: priceResults.pro?.active,
            currency: priceResults.pro?.currency,
            unit_amount: priceResults.pro?.unit_amount,
            product: priceResults.pro?.product,
            type: priceResults.pro?.type,
          },
    }

    return NextResponse.json({
      connectionStatus: "success",
      balance: {
        available: balance.available,
        pending: balance.pending,
      },
      prices: formattedPrices,
    })
  } catch (error) {
    console.error("Erreur lors du test de connexion Stripe:", error)
    return NextResponse.json(
      {
        connectionStatus: "error",
        error: "Erreur de connexion à l'API Stripe",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
