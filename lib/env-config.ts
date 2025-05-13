/**
 * Configuration des variables d'environnement
 * Ce fichier centralise l'accès aux variables d'environnement
 * et fournit des valeurs par défaut sécurisées
 */

// Variables d'environnement côté serveur (ne sont jamais exposées au client)
export const serverEnv = {
  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || "",

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Autres configurations serveur
  NODE_ENV: process.env.NODE_ENV || "development",

  // Ajouter un log pour déboguer les variables d'environnement au démarrage du serveur
  logEnvStatus: () => {
    console.log("Environment configuration:")
    console.log(
      "- OPENAI_API_KEY:",
      process.env.OPENAI_API_KEY ? "Set (length: " + process.env.OPENAI_API_KEY.length + ")" : "Not set",
    )
    console.log("- ALPHA_VANTAGE_API_KEY:", process.env.ALPHA_VANTAGE_API_KEY ? "Set" : "Not set")
    console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Set" : "Not set")
    console.log("- NODE_ENV:", process.env.NODE_ENV || "development")
  },
}

// Variables d'environnement côté client (préfixées par NEXT_PUBLIC_)
// IMPORTANT: Ne jamais inclure de clés API sensibles ici
export const clientEnv = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Autres configurations client
  NEXT_PUBLIC_USE_MOCK_PAYMENTS: process.env.NEXT_PUBLIC_USE_MOCK_PAYMENTS === "true",
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
}

// Fonction utilitaire pour vérifier si une clé API est disponible côté serveur
// Cette fonction ne doit être utilisée que dans des composants serveur
export function isServerApiKeyAvailable(key: keyof typeof serverEnv): boolean {
  return !!serverEnv[key]
}

// Fonction utilitaire pour vérifier si une variable d'environnement client est disponible
export function isClientEnvAvailable(key: keyof typeof clientEnv): boolean {
  return !!clientEnv[key]
}

// Fonction pour vérifier si les API sont configurées (à utiliser côté client)
// Ne renvoie que des booléens, pas les clés elles-mêmes
export function getApiStatus() {
  return {
    hasOpenAiKey: false, // Sera déterminé par une route API
    hasAlphaVantageKey: false, // Sera déterminé par une route API
  }
}

// Ajouter la fonction getConfig manquante après les fonctions existantes et avant l'initialisation

// Fonction pour obtenir la configuration complète
// Cette fonction est utilisée pour accéder à la configuration de manière unifiée
export function getConfig() {
  return {
    // Configuration serveur (ne sera accessible que côté serveur)
    server: {
      openai: {
        apiKey: serverEnv.OPENAI_API_KEY,
        isAvailable: !!serverEnv.OPENAI_API_KEY,
      },
      alphaVantage: {
        apiKey: serverEnv.ALPHA_VANTAGE_API_KEY,
        isAvailable: !!serverEnv.ALPHA_VANTAGE_API_KEY,
      },
      supabase: {
        url: serverEnv.SUPABASE_URL,
        anonKey: serverEnv.SUPABASE_ANON_KEY,
        serviceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
        isConfigured: !!serverEnv.SUPABASE_URL && !!serverEnv.SUPABASE_ANON_KEY,
      },
      environment: serverEnv.NODE_ENV,
    },

    // Configuration client (accessible côté client)
    client: {
      supabase: {
        url: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isConfigured: !!clientEnv.NEXT_PUBLIC_SUPABASE_URL && !!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      useMockPayments: clientEnv.NEXT_PUBLIC_USE_MOCK_PAYMENTS,
      apiBaseUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
    },

    // Fonctions utilitaires
    isProduction: typeof window === "undefined" ? serverEnv.NODE_ENV === "production" : false,
    isDevelopment: typeof window === "undefined" ? serverEnv.NODE_ENV === "development" : true,
  }
}

// Initialiser l'environnement au démarrage si en mode serveur
if (typeof window === "undefined") {
  serverEnv.logEnvStatus()
}
