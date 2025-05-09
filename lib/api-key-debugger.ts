import { serverEnv } from "./env-config"

/**
 * Cette fonction vérifie l'état de la clé API OpenAI
 * et renvoie des informations détaillées pour le débogage
 */
export function debugOpenAIKey() {
  // Récupérer la clé API
  const apiKey = serverEnv.OPENAI_API_KEY

  // Informations de débogage
  const debug = {
    keyExists: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyFirstChars: apiKey ? apiKey.substring(0, 4) : "",
    keyLastChars: apiKey ? apiKey.substring(apiKey.length - 4) : "",
    keyFormat: apiKey ? (apiKey.startsWith("sk-") ? "valid" : "invalid") : "missing",
    envVariables: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  }

  console.log("OpenAI API Key Debug:", debug)
  return debug
}
