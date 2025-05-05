import Stripe from "stripe"

// Vérifier que les variables d'environnement Stripe sont définies
export function validateStripeConfig() {
  const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PREMIUM_PRICE_ID",
    "STRIPE_PRO_PRICE_ID",
  ]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`Variables d'environnement Stripe manquantes: ${missingVars.join(", ")}`)
    return {
      isValid: false,
      missingVars,
    }
  }

  return {
    isValid: true,
    config: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
      proPriceId: process.env.STRIPE_PRO_PRICE_ID!,
    },
  }
}

// Créer une instance Stripe
export function getStripeInstance() {
  const { isValid, config } = validateStripeConfig()

  if (!isValid) {
    throw new Error("Configuration Stripe invalide")
  }

  return new Stripe(config.secretKey, {
    apiVersion: "2023-10-16", // Utilisez la version la plus récente
    appInfo: {
      name: "QANT Finance App",
      version: "1.0.0",
    },
  })
}

// Récupérer les informations de prix
export async function getStripePrices() {
  try {
    const stripe = getStripeInstance()

    const { config } = validateStripeConfig()

    const premiumPrice = await stripe.prices.retrieve(config.premiumPriceId)
    const proPrice = await stripe.prices.retrieve(config.proPriceId)

    return {
      premium: {
        id: premiumPrice.id,
        amount: premiumPrice.unit_amount,
        currency: premiumPrice.currency,
        interval: premiumPrice.recurring?.interval,
      },
      pro: {
        id: proPrice.id,
        amount: proPrice.unit_amount,
        currency: proPrice.currency,
        interval: proPrice.recurring?.interval,
      },
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des prix Stripe:", error)
    throw error
  }
}
