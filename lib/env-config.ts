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
