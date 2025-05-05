import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

// Initialiser Prisma
export const db = new PrismaClient()

// Initialiser Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Créer un client Supabase avec la clé anonyme (pour le client)
export const supabaseClient = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Créer un client Supabase avec la clé de service (pour le serveur)
export const supabaseAdmin = createClient(supabaseUrl || "", supabaseServiceKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Fonction utilitaire pour vérifier si la configuration Supabase est valide
export function isSupabaseConfigured() {
  return !!supabaseUrl && (!!supabaseAnonKey || !!supabaseServiceKey)
}
