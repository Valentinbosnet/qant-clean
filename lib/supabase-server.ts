import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Exporter la fonction createServerClient comme alias pour la compatibilité
export { createServerSupabaseClient as createServerClient }

// Fonction pour obtenir l'utilisateur actuel côté serveur
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Fonction pour obtenir le profil utilisateur côté serveur
export async function getServerProfile(userId?: string) {
  const supabase = createServerSupabaseClient()

  // Si aucun userId n'est fourni, obtenir l'utilisateur actuel
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id
  }

  if (!userId) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return null
  }

  return data
}
