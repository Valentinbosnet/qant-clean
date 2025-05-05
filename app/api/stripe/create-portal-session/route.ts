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

    // Récupérer l'utilisateur à partir du cookie de session
    const cookieStore = cookies()
    const userInfoCookie = cookieStore.get("user-info")

    if (!userInfoCookie?.value) {
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

    // Initialiser Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Erreur: Configuration Supabase manquante")
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer le client Stripe de l'utilisateur
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", userInfo.id)
      .single()

    if (customerError || !customerData) {
      console.error("Erreur: Client Stripe non trouvé", customerError)
      return NextResponse.json({ error: "Client Stripe non trouvé" }, { status: 404 })
    }

    // Créer une session du portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${req.headers.get("origin")}/settings/subscription`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Erreur lors de la création de la session du portail:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la session du portail",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
