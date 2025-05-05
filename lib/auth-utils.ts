import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function verifySession(sessionToken: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Configuration Supabase manquante")
      return { valid: false, error: "Configuration du serveur incorrecte" }
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier la validité du token
    const { data, error } = await supabase.auth.getUser(sessionToken)

    if (error || !data.user) {
      console.error("Session invalide:", error)
      return { valid: false, error: error?.message || "Session invalide" }
    }

    return { valid: true, user: data.user }
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error)
    return { valid: false, error: "Erreur lors de la vérification de la session" }
  }
}

export async function refreshSessionIfNeeded() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("app-session")

  if (!sessionCookie?.value) {
    return { success: false, error: "Pas de session" }
  }

  try {
    const { valid, user, error } = await verifySession(sessionCookie.value)

    if (!valid) {
      // Supprimer les cookies invalides
      cookieStore.delete("app-session")
      cookieStore.delete("has-subscription")
      cookieStore.delete("user-info")
      return { success: false, error }
    }

    // La session est valide, pas besoin de la rafraîchir
    return { success: true, user }
  } catch (error) {
    console.error("Erreur lors du rafraîchissement de la session:", error)
    return { success: false, error: "Erreur lors du rafraîchissement de la session" }
  }
}
