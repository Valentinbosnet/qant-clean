import Stripe from "stripe"

// Initialiser Stripe avec la clé secrète
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

interface CreateCheckoutSessionArgs {
  priceId: string
  userId: string
  email: string
  returnUrl?: string
}

// Fonction pour créer une session de paiement
export async function createCheckoutSession({ priceId, userId, email, returnUrl }: CreateCheckoutSessionArgs) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId,
      },
    })

    return session
  } catch (error) {
    console.error("Erreur lors de la création de la session de paiement:", error)
    throw error
  }
}

// Fonction pour créer une session de portail de facturation
export async function createBillingPortalSession({ customerId }: { customerId: string }) {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXTAUTH_URL + "/settings/subscription", // URL de retour après la gestion de l'abonnement
    })

    return portalSession
  } catch (error) {
    console.error("Erreur lors de la création de la session de portail:", error)
    throw error
  }
}
