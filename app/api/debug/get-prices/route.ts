import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    // Vérifier la clé API Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Clé API Stripe non configurée" }, { status: 500 })
    }

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Récupérer les produits
    const products = await stripe.products.list({
      active: true,
      limit: 10,
    })

    // Pour chaque produit, récupérer ses prix
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 5,
        })

        return {
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            active: product.active,
          },
          prices: prices.data.map((price) => ({
            id: price.id,
            currency: price.currency,
            unit_amount: price.unit_amount,
            recurring: price.recurring,
            type: price.type,
          })),
        }
      }),
    )

    return NextResponse.json({ products: productsWithPrices })
  } catch (error) {
    console.error("Erreur lors de la récupération des prix:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prix", details: (error as Error).message },
      { status: 500 },
    )
  }
}
