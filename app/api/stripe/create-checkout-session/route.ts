import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    // Vérifier si la clé API Stripe est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Erreur: STRIPE_SECRET_KEY non configurée")
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 })
    }

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Récupérer les données de la requête
    const { priceId, successUrl, cancelUrl } = await req.json()

    console.log("Données reçues:", { priceId, successUrl, cancelUrl })

    if (!priceId) {
      console.error("Erreur: priceId manquant dans la requête")
      return NextResponse.json({ error: "ID de prix manquant" }, { status: 400 })
    }

    // Vérifier si l'ID de prix est valide
    try {
      await stripe.prices.retrieve(priceId)
    } catch (error) {
      console.error(`Erreur: ID de prix invalide (${priceId})`, error)
      return NextResponse.json(
        {
          error: `ID de prix invalide: ${priceId}`,
          details: "Vérifiez que vous avez créé ce prix dans votre compte Stripe et que vous utilisez le bon ID.",
        },
        { status: 400 },
      )
    }

    // Récupérer l'utilisateur à partir du cookie de session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("app-session")
    const userInfoCookie = cookieStore.get("user-info")

    if (!sessionCookie?.value || !userInfoCookie?.value) {
      console.error("Erreur: Utilisateur non authentifié")
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 })
    }

    let userInfo
    try {
      userInfo = JSON.parse(userInfoCookie.value)
    } catch (error) {
      console.error("Erreur lors du parsing du cookie utilisateur:", error)
      return NextResponse.json({ error: "Cookie utilisateur invalide" }, { status: 400 })
    }

    console.log("Utilisateur authentifié:", userInfo.email)

    // Vérifier si l'utilisateur existe dans Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Erreur: Configuration Supabase manquante")
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("id, email")
      .eq("id", userInfo.id)
      .single()

    if (userError || !userData) {
      console.error("Erreur: Utilisateur non trouvé dans Supabase", userError)
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur a déjà un ID client Stripe
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", userInfo.id)
      .maybeSingle()

    let customerId: string

    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id
      console.log("Client Stripe existant:", customerId)
    } else {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userInfo.id,
        },
      })

      customerId = customer.id
      console.log("Nouveau client Stripe créé:", customerId)

      // Enregistrer l'ID client Stripe dans la base de données
      await supabase.from("customers").insert({
        user_id: userInfo.id,
        stripe_customer_id: customerId,
      })
    }

    // Créer la session de paiement
    console.log("Création de la session de paiement avec le prix:", priceId)
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?payment=cancelled`,
      metadata: {
        userId: userInfo.id,
      },
    })

    console.log("Session de paiement créée avec succès, ID:", stripeSession.id)

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Erreur lors de la création de la session de paiement:", error)

    // Formater l'erreur pour un meilleur débogage
    let errorMessage = "Erreur inconnue"
    let errorDetails = null

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Erreur Stripe: ${error.type}`
      errorDetails = error.message
      console.error("Type d'erreur Stripe:", error.type)
      console.error("Message d'erreur Stripe:", error.message)
    } else if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
