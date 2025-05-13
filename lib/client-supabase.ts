"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

// Singleton pattern pour éviter de créer plusieurs instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getBrowserClient() {
  if (typeof window === "undefined") {
    console.warn("getBrowserClient doit être appelé côté client uniquement")
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }

  return supabaseClient
}

// Ajout de l'export manquant getBrowserClient comme alias de getClientSupabase
export const getClientSupabase = getBrowserClient

// Fonction pour tester manuellement la connexion à Supabase
export async function testSupabaseConnection() {
  if (typeof window === "undefined") {
    console.warn("testSupabaseConnection a été appelé côté serveur, ce qui n'est pas recommandé")
    return { success: false, message: "Fonction appelée côté serveur" }
  }

  if (!supabaseClient) {
    return { success: false, message: "Client Supabase non initialisé" }
  }

  try {
    console.log("Test manuel de connexion à Supabase...")

    // Utiliser une requête simple qui ne nécessite pas d'authentification
    const { data, error, status } = await supabaseClient
      .from("favorites")
      .select("count", { count: "exact", head: true })

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

// Fonction pour vérifier si le code s'exécute côté client
export function isClient() {
  return typeof window !== "undefined"
}

// Fonction pour réinitialiser le client (utile pour les tests ou lors de la déconnexion)
export function resetBrowserClient() {
  supabaseClient = null
  console.log("Client Supabase réinitialisé")
}

// Ajout de l'export manquant resetClientSupabase comme alias de resetBrowserClient
export const resetClientSupabase = resetBrowserClient

// Fonction pour vérifier les variables d'environnement
export function checkEnvironmentVariables() {
  const variables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  const status = {
    url: !!variables.NEXT_PUBLIC_SUPABASE_URL,
    key: !!variables.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    env: variables.NODE_ENV,
  }

  console.log("Variables d'environnement:", status)

  return status
}

// Fonction pour vérifier les variables d'environnement de manière détaillée
export function checkEnvironmentVariablesDetailed() {
  const variables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  const status = {
    url: {
      defined: !!variables.NEXT_PUBLIC_SUPABASE_URL,
      value: variables.NEXT_PUBLIC_SUPABASE_URL,
      length: variables.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      valid: !!variables.NEXT_PUBLIC_SUPABASE_URL && variables.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://"),
    },
    key: {
      defined: !!variables.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      // Ne jamais afficher la clé complète, seulement les premiers caractères
      preview: variables.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${variables.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
        : null,
      length: variables.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      valid: !!variables.NEXT_PUBLIC_SUPABASE_ANON_KEY && variables.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20,
    },
    env: variables.NODE_ENV,
    browser:
      typeof window !== "undefined"
        ? {
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            onLine: navigator.onLine,
          }
        : null,
  }

  console.log("Vérification détaillée des variables d'environnement:", status)

  return status
}
