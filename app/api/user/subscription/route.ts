import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {
  try {
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

    // Récupérer l'abonnement de l'utilisateur
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userInfo.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscriptionError) {
      console.error("Erreur: Impossible de récupérer l'abonnement", subscriptionError)
      return NextResponse.json({ error: "Impossible de récupérer l'abonnement" }, { status: 500 })
    }

    if (!subscriptionData) {
      return NextResponse.json({ subscription: null })
    }

    // Formater les données d'abonnement
    const subscription = {
      id: subscriptionData.id,
      status: subscriptionData.status,
      priceId: subscriptionData.price_id,
      currentPeriodEnd: subscriptionData.current_period_end,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'abonnement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
