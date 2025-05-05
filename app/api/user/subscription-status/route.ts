import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("app-session")
    const userInfoCookie = cookieStore.get("user-info")

    if (!sessionCookie?.value || !userInfoCookie?.value) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 })
    }

    // Récupérer les informations utilisateur
    let userInfo
    try {
      userInfo = JSON.parse(userInfoCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Session utilisateur invalide" }, { status: 400 })
    }

    // Initialiser Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer l'abonnement de l'utilisateur
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userInfo.id)
      .eq("status", "active")
      .maybeSingle()

    if (subscriptionError) {
      console.error("Erreur lors de la récupération de l'abonnement:", subscriptionError)
      return NextResponse.json({ error: "Erreur lors de la récupération de l'abonnement" }, { status: 500 })
    }

    // Mettre à jour le cookie d'abonnement
    const hasSubscription = !!subscription
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours

    cookieStore.set({
      name: "has-subscription",
      value: JSON.stringify({
        active: hasSubscription,
        plan: subscription ? subscription.price_id : null,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({
      hasSubscription,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            priceId: subscription.price_id,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        : null,
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification de l'abonnement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
