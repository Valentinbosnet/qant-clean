import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Désactiver le parsing du corps de la requête par Next.js
export const config = {
  api: {
    bodyParser: false,
  },
}

// Fonction pour récupérer le corps de la requête brut
async function getRawBody(req: Request): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(req: Request) {
  try {
    // Vérifier si la clé API Stripe et la clé de signature du webhook sont configurées
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Erreur: Configuration Stripe manquante")
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 })
    }

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Récupérer la signature Stripe du header
    const headersList = headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.error("Erreur: Signature Stripe manquante")
      return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 })
    }

    // Récupérer le corps de la requête brut
    const rawBody = await getRawBody(req)

    // Vérifier la signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error("Erreur lors de la vérification de la signature:", error)
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
    }

    console.log("Événement Stripe reçu:", event.type)

    // Initialiser Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Erreur: Configuration Supabase manquante")
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Traiter les différents types d'événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Vérifier que c'est un abonnement
        if (session.mode !== "subscription") {
          console.log("Session non liée à un abonnement, ignorée")
          return NextResponse.json({ received: true })
        }

        // Récupérer l'ID de l'utilisateur depuis les métadonnées
        const userId = session.metadata?.userId

        if (!userId) {
          console.error("Erreur: ID utilisateur manquant dans les métadonnées")
          return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 })
        }

        // Récupérer l'abonnement
        if (!session.subscription) {
          console.error("Erreur: ID d'abonnement manquant dans la session")
          return NextResponse.json({ error: "ID d'abonnement manquant" }, { status: 400 })
        }

        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Enregistrer l'abonnement dans la base de données
        const { error: insertError } = await supabase.from("subscriptions").insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })

        if (insertError) {
          console.error("Erreur lors de l'enregistrement de l'abonnement:", insertError)
          return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'abonnement" }, { status: 500 })
        }

        console.log("Abonnement enregistré avec succès:", subscription.id)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Récupérer l'abonnement existant
        const { data: existingSubscription, error: selectError } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (selectError) {
          console.error("Erreur lors de la récupération de l'abonnement:", selectError)
          return NextResponse.json({ error: "Erreur lors de la récupération de l'abonnement" }, { status: 500 })
        }

        if (!existingSubscription) {
          console.error("Erreur: Abonnement non trouvé dans la base de données")
          return NextResponse.json({ error: "Abonnement non trouvé" }, { status: 404 })
        }

        // Mettre à jour l'abonnement
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (updateError) {
          console.error("Erreur lors de la mise à jour de l'abonnement:", updateError)
          return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement" }, { status: 500 })
        }

        console.log("Abonnement mis à jour avec succès:", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Mettre à jour l'abonnement
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (updateError) {
          console.error("Erreur lors de la mise à jour de l'abonnement:", updateError)
          return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement" }, { status: 500 })
        }

        console.log("Abonnement supprimé avec succès:", subscription.id)
        break
      }

      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
