"use client"

import { createClient } from "@supabase/supabase-js"

// Créer un client Supabase pour le navigateur
// Cette version est spécifiquement pour les composants client
let browserClient: ReturnType<typeof createClient> | null = null

export function getClientSupabase() {
  if (typeof window === "undefined") {
    // Retourner un client factice ou null si appelé côté serveur
    console.warn("getClientSupabase a été appelé côté serveur, ce qui n'est pas recommandé")
    return null
  }

  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables d'environnement Supabase manquantes")
      throw new Error("Variables d'environnement Supabase manquantes")
    }

    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce", // Utiliser PKCE pour une sécurité renforcée
      },
    })
  }

  return browserClient
}
