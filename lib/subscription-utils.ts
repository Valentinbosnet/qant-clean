import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function checkSubscriptionStatus(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Configuration Supabase manquante")
      return { active: false, error: "Configuration du serveur incorrecte" }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error)
      return { active: false, error: error.message }
    }

    return { active: !!data, subscription: data }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement:", error)
    return { active: false, error: "Erreur lors de la vérification de l'abonnement" }
  }
}

export async function updateSubscriptionCookie(userId: string) {
  try {
    const { active, subscription, error } = await checkSubscriptionStatus(userId)

    if (error) {
      console.error("Erreur lors de la mise à jour du cookie d'abonnement:", error)
      return { success: false, error }
    }

    const cookieStore = cookies()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours

    cookieStore.set({
      name: "has-subscription",
      value: JSON.stringify({
        active,
        userId,
        subscriptionId: subscription?.id,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 jours en secondes
    })

    return { success: true, active }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cookie d'abonnement:", error)
    return { success: false, error: "Erreur lors de la mise à jour du cookie d'abonnement" }
  }
}
