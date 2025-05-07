"use client"

import { createClient } from "@supabase/supabase-js"

// Créer un client Supabase pour le navigateur
// Cette version est spécifiquement pour les composants client
let browserClient: ReturnType<typeof createClient> | null = null
let initializationAttempts = 0
const MAX_ATTEMPTS = 3

export function getClientSupabase() {
  if (typeof window === "undefined") {
    // Retourner un client factice ou null si appelé côté serveur
    console.warn("getClientSupabase a été appelé côté serveur, ce qui n'est pas recommandé")
    return null
  }

  if (!browserClient) {
    try {
      initializationAttempts++
      console.log(`Initialisation du client Supabase côté client (tentative ${initializationAttempts})`)

      // Récupérer les variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Vérifier si les variables d'environnement sont définies
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Variables d'environnement Supabase manquantes:", {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey,
        })

        // Afficher les valeurs réelles pour le débogage (attention à ne pas faire cela en production)
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log(
          "Key (longueur):",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0,
        )

        throw new Error("Variables d'environnement Supabase manquantes")
      }

      // Créer le client avec des options de fetch personnalisées pour une meilleure gestion des erreurs
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce", // Utiliser PKCE pour une sécurité renforcée
        },
      })

      console.log("Client Supabase initialisé avec succès")
    } catch (error) {
      console.error("Erreur lors de l'initialisation du client Supabase:", error)

      // Si nous n'avons pas atteint le nombre maximum de tentatives, nous réessayons
      if (initializationAttempts < MAX_ATTEMPTS) {
        console.log(`Nouvelle tentative d'initialisation (${initializationAttempts}/${MAX_ATTEMPTS})...`)
        // Réinitialiser pour la prochaine tentative
        browserClient = null
        // Réessayer après un court délai
        setTimeout(() => getClientSupabase(), 1000)
      }

      return null
    }
  }

  return browserClient
}

// Fonction pour tester manuellement la connexion à Supabase
export async function testSupabaseConnection() {
  if (typeof window === "undefined") {
    console.warn("testSupabaseConnection a été appelé côté serveur, ce qui n'est pas recommandé")
    return { success: false, message: "Fonction appelée côté serveur" }
  }

  if (!browserClient) {
    return { success: false, message: "Client Supabase non initialisé" }
  }

  try {
    console.log("Test manuel de connexion à Supabase...")

    // Utiliser une requête simple qui ne nécessite pas d'authentification
    const { data, error, status } = await browserClient
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

// Fonction pour réinitialiser le client (utile pour les tests ou en cas d'erreur)
export function resetClientSupabase() {
  browserClient = null
  initializationAttempts = 0
  console.log("Client Supabase réinitialisé")
}

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

// Ajouter cette fonction à la fin du fichier

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
