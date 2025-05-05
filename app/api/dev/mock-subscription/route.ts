import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    // Récupérer les données de la requête
    const data = await req.json()
    const { plan } = data

    if (!plan) {
      return NextResponse.json({ error: "Plan requis" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const sessionCookie = cookies().get("app-session")
    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les informations de l'utilisateur depuis le cookie user-info
    const userInfoCookie = cookies().get("user-info")
    if (!userInfoCookie) {
      return NextResponse.json({ error: "Informations utilisateur non disponibles" }, { status: 401 })
    }

    let userInfo
    try {
      userInfo = JSON.parse(userInfoCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Impossible de parser les informations utilisateur" }, { status: 400 })
    }

    const userId = userInfo.id

    // Initialiser le client Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, email")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur a déjà un abonnement
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    // Créer ou mettre à jour l'abonnement
    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours

    let subscription
    if (existingSubscription) {
      // Mettre à jour l'abonnement existant
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          plan: plan,
          stripeCurrentPeriodEnd: endDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingSubscription.id)
        .select()
        .single()

      if (updateError) {
        console.error("Erreur lors de la mise à jour de l'abonnement:", updateError)
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement" }, { status: 500 })
      }

      subscription = updatedSubscription
    } else {
      // Créer un nouvel abonnement
      const { data: newSubscription, error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          stripe_subscription_id: `mock_sub_${Math.random().toString(36).substring(2, 15)}`,
          stripe_customer_id: `mock_cus_${Math.random().toString(36).substring(2, 15)}`,
          status: "active",
          plan: plan,
          stripeCurrentPeriodEnd: endDate.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error("Erreur lors de la création de l'abonnement:", createError)
        return NextResponse.json({ error: "Erreur lors de la création de l'abonnement" }, { status: 500 })
      }

      subscription = newSubscription
    }

    // Mettre à jour le cookie has-subscription
    cookies().set(
      "has-subscription",
      JSON.stringify({
        active: true,
        userId,
        plan,
      }),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    )

    return NextResponse.json({
      success: true,
      message: "Abonnement simulé créé avec succès",
      subscription,
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'abonnement simulé:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la création de l'abonnement simulé",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
