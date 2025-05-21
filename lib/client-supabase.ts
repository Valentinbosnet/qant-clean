"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Singleton pattern pour éviter de créer plusieurs instances
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null
let initializationAttempts = 0
const MAX_INITIALIZATION_ATTEMPTS = 3

export function checkEnvironmentVariables(): {
  isConfigured: boolean
  missingVars: string[]
  message: string
} {
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  const missingVars = requiredVars.filter((varName) => {
    return typeof process.env[varName] === "undefined" || process.env[varName] === ""
  })

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    message:
      missingVars.length > 0
        ? `Variables d'environnement manquantes: ${missingVars.join(", ")}`
        : "Configuration Supabase complète",
  }
}

export function getBrowserClient() {
  if (typeof window === "undefined") {
    console.warn("getBrowserClient doit être appelé côté client uniquement")
    return null
  }

  // Si le client existe déjà, le retourner
  if (supabaseClient) {
    return supabaseClient
  }

  // Vérifier si nous avons dépassé le nombre maximum de tentatives
  if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
    console.error("Nombre maximum de tentatives d'initialisation du client Supabase atteint")
    return null
  }

  initializationAttempts++

  try {
    // Récupérer les variables d'environnement
    const { isConfigured, missingVars, message } = checkEnvironmentVariables()

    // Vérifier si les variables d'environnement sont définies
    if (!isConfigured) {
      console.error(message)
      return null
    }

    // Créer le client Supabase
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      },
    )

    console.log("Client Supabase initialisé avec succès")
    return supabaseClient
  } catch (error) {
    console.error("Erreur lors de l'initialisation du client Supabase:", error)
    return null
  }
}

// Alias pour la compatibilité
export const getClientSupabase = getBrowserClient

// Fonction pour réinitialiser le client
export function resetBrowserClient() {
  supabaseClient = null
  initializationAttempts = 0
  console.log("Client Supabase réinitialisé")
}

// Alias pour la compatibilité
export const resetClientSupabase = resetBrowserClient

// Fonction pour vérifier si le code s'exécute côté client
export function isClient() {
  return typeof window !== "undefined"
}

// Fonction pour tester manuellement la connexion à Supabase
export async function testSupabaseConnection() {
  if (typeof window === "undefined") {
    return { success: false, message: "Fonction appelée côté serveur" }
  }

  const client = getBrowserClient()
  if (!client) {
    return { success: false, message: "Client Supabase non initialisé" }
  }

  try {
    console.log("Test manuel de connexion à Supabase...")

    // Utiliser une requête simple qui ne nécessite pas d'authentification
    const { data, error, status } = await client.from("favorites").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Erreur lors du test de connexion:", error)
      return {
        success: false,
        message: `Erreur: ${error.message}`,
        details: { code: error.code, hint: error.hint, status },
      }
    }

    console.log("Connexion à Supabase réussie")
    return { success: true, message: "Connexion réussie", status }
  } catch (error: any) {
    console.error("Exception lors du test de connexion:", error)
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      details: error,
    }
  }
}
