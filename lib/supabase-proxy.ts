"use client"

import { isClient } from "./client-supabase"

// Types pour les requêtes Supabase
interface SupabaseProxyRequest {
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}

// Fonction pour contourner les problèmes CORS en utilisant un proxy si nécessaire
export async function supabaseFetch(url: string, options: RequestInit): Promise<Response> {
  if (!isClient()) {
    throw new Error("supabaseFetch ne peut être utilisé que côté client")
  }

  // Essayer d'abord une requête directe
  try {
    console.log(`Tentative de requête directe vers: ${url}`)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 secondes de timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log(`Requête directe réussie: ${response.status}`)
    return response
  } catch (error: any) {
    console.warn(`Échec de la requête directe: ${error.message}`)

    // Si la requête directe échoue, essayer avec une solution alternative
    return await fallbackFetch(url, options)
  }
}

// Fonction de repli pour les cas où fetch échoue
async function fallbackFetch(url: string, options: RequestInit): Promise<Response> {
  console.log("Utilisation de la méthode de repli pour la requête")

  // Option 1: Utiliser un service proxy CORS (comme cors-anywhere)
  try {
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url)
    console.log(`Tentative via proxy CORS: ${proxyUrl}`)

    const response = await fetch(proxyUrl, options)
    console.log(`Requête proxy réussie: ${response.status}`)
    return response
  } catch (error: any) {
    console.warn(`Échec de la requête proxy: ${error.message}`)

    // Option 2: Simuler une réponse pour les opérations critiques
    // Ceci est une solution de dernier recours pour permettre à l'application de fonctionner
    // même en cas de problèmes de connectivité
    console.log("Simulation d'une réponse pour permettre à l'application de continuer")

    // Analyser l'URL pour déterminer le type de requête
    if (url.includes("/auth/v1/token") && options.method === "POST") {
      // Simuler une réponse d'échec d'authentification
      return createMockResponse(
        {
          error: "network_error",
          error_description: "Impossible de se connecter au serveur d'authentification",
        },
        503,
      )
    } else if (url.includes("/auth/v1/signup") && options.method === "POST") {
      // Simuler une réponse d'échec d'inscription
      return createMockResponse(
        {
          error: "network_error",
          error_description: "Impossible de se connecter au serveur d'inscription",
        },
        503,
      )
    } else {
      // Réponse générique pour les autres requêtes
      return createMockResponse(
        {
          error: "network_error",
          message: "Impossible de se connecter à Supabase",
        },
        503,
      )
    }
  }
}

// Fonction pour créer une réponse simulée
function createMockResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// Modifier la fonction checkSupabaseConnectivity pour inclure plus de détails de diagnostic

// Remplacer la fonction checkSupabaseConnectivity par celle-ci :
export async function checkSupabaseConnectivity(): Promise<{
  direct: boolean
  proxy: boolean
  error?: string
  details?: any
}> {
  if (!isClient()) {
    return { direct: false, proxy: false, error: "Fonction appelée côté serveur" }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return { direct: false, proxy: false, error: "URL Supabase non définie" }
  }

  const result = {
    direct: false,
    proxy: false,
    error: undefined as string | undefined,
    details: {} as any,
  }

  // Test de connexion directe
  try {
    console.log("Test de connexion directe à Supabase...")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    result.direct = response.ok

    // Capturer plus de détails sur la réponse
    result.details.direct = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    }

    if (!response.ok) {
      try {
        const errorData = await response.json()
        result.details.direct.error = errorData
      } catch (e) {
        // Ignorer les erreurs de parsing JSON
      }
    }

    console.log("Résultat du test direct:", result.direct ? "Succès" : "Échec", result.details.direct)
  } catch (error: any) {
    console.error("Erreur lors du test direct:", error)
    result.error = `Connexion directe: ${error.message}`
    result.details.direct = {
      error: error.message,
      name: error.name,
      stack: error.stack,
    }
  }

  // Test de connexion via proxy
  if (!result.direct) {
    try {
      console.log("Test de connexion via proxy...")
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(`${supabaseUrl}/rest/v1/`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      result.proxy = response.ok

      // Capturer plus de détails sur la réponse
      result.details.proxy = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      }

      if (!response.ok) {
        try {
          const errorData = await response.json()
          result.details.proxy.error = errorData
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      }

      console.log("Résultat du test proxy:", result.proxy ? "Succès" : "Échec", result.details.proxy)
    } catch (error: any) {
      console.error("Erreur lors du test proxy:", error)
      if (!result.error) {
        result.error = `Connexion proxy: ${error.message}`
      } else {
        result.error += ` | Connexion proxy: ${error.message}`
      }
      result.details.proxy = {
        error: error.message,
        name: error.name,
        stack: error.stack,
      }
    }
  }

  // Ajouter des informations sur l'environnement
  result.details.environment = {
    userAgent: navigator.userAgent,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    isHttps: window.location.protocol === "https:",
    host: window.location.host,
  }

  return result
}
