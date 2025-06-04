import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// --- Début des Vérifications Critiques des Variables d'Environnement ---
console.log("--- [NextAuth API Route] Initialisation et Vérification des Variables d'Environnement ---")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || process.env.VERCEL_URL // Utilise VERCEL_URL comme fallback

console.log(
  `[NextAuth API Route] NEXTAUTH_URL utilisé: ${NEXTAUTH_URL ? `https_//${NEXTAUTH_URL}` : "Non défini (problématique si pas sur Vercel avec domaine auto)"}`,
)
console.log(
  `[NextAuth API Route] NEXTAUTH_SECRET est défini: ${!!NEXTAUTH_SECRET} (Longueur: ${NEXTAUTH_SECRET?.length || 0})`,
)
console.log(`[NextAuth API Route] GOOGLE_CLIENT_ID est défini: ${!!GOOGLE_CLIENT_ID}`)
console.log(`[NextAuth API Route] GOOGLE_CLIENT_SECRET est défini: ${!!GOOGLE_CLIENT_SECRET}`)

const criticalErrorMessages: string[] = []

if (!NEXTAUTH_SECRET) {
  const msg =
    "ERREUR CRITIQUE: NEXTAUTH_SECRET n'est pas défini côté serveur! NextAuth ne peut pas fonctionner. Vérifiez vos variables d'environnement sur Vercel."
  console.error(`[NextAuth API Route] ${msg}`)
  criticalErrorMessages.push(msg)
} else if (NEXTAUTH_SECRET.length < 32) {
  console.warn(
    `[NextAuth API Route] AVERTISSEMENT: NEXTAUTH_SECRET est défini mais sa longueur (${NEXTAUTH_SECRET.length}) est inférieure à 32 caractères. Un secret plus long et complexe est fortement recommandé.`,
  )
}

const providers = []
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  )
  console.log("[NextAuth API Route] GoogleProvider configuré.")
} else {
  const msg =
    "ERREUR: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET n'est pas défini. GoogleProvider ne sera pas disponible."
  console.error(`[NextAuth API Route] ${msg}`)
  // Ne pas ajouter au message d'erreur critique bloquant, mais le provider ne fonctionnera pas
}

if (providers.length === 0) {
  const msg =
    "AVERTISSEMENT: Aucun fournisseur d'authentification (provider) n'a été configuré avec succès car les variables d'environnement nécessaires sont manquantes. L'authentification ne fonctionnera pas."
  console.error(`[NextAuth API Route] ${msg}`)
  // Si vous n'avez que Google et qu'il échoue, cela devient critique pour l'authentification.
  // criticalErrorMessages.push(msg) // Décommentez si l'absence de TOUT provider est une erreur fatale pour vous
}
console.log("--- [NextAuth API Route] Fin des Vérifications des Variables d'Environnement ---")
// --- Fin des Vérifications Critiques ---

export const authOptions: NextAuthOptions = {
  providers: providers,
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development", // Active plus de logs en dev
  logger: {
    error(code, metadata) {
      console.error(`[NEXTAUTH_LOGGER_ERROR] Code: ${code}`, metadata)
      if (metadata instanceof Error && metadata.stack) {
        console.error(`[NEXTAUTH_LOGGER_ERROR] Stack: ${metadata.stack}`)
      }
    },
    warn(code) {
      console.warn(`[NEXTAUTH_LOGGER_WARN] Code: ${code}`)
    },
  },
}

let handler: any

if (criticalErrorMessages.length > 0 || !NEXTAUTH_SECRET) {
  // Ajout de !NEXTAUTH_SECRET ici pour être explicite
  console.error(
    "[NextAuth API Route] ERREUR FATALE D'INITIALISATION due à des variables d'environnement manquantes ou invalides. Voir logs ci-dessus.",
  )
  console.error("[NextAuth API Route] Messages d'erreur critiques:", criticalErrorMessages.join(" | "))
  handler = () => {
    const responseBody = `Erreur serveur critique: Problème de configuration de l'authentification. Vérifiez les variables d'environnement (NEXTAUTH_SECRET, etc.) sur Vercel. Détails: ${criticalErrorMessages.join("; ")}`
    return new Response(responseBody, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
} else {
  try {
    console.log("[NextAuth API Route] Tentative d'initialisation de NextAuth(authOptions)...")
    handler = NextAuth(authOptions)
    console.log("[NextAuth API Route] NextAuth(authOptions) initialisé avec succès.")
  } catch (error: any) {
    console.error("[NextAuth API Route] ERREUR CATCH lors de NextAuth(authOptions):", error.message)
    if (error.stack) {
      console.error("[NextAuth API Route] Stack d'erreur CATCH:", error.stack)
    }
    const responseBody = `Erreur serveur critique lors de l'initialisation de l'authentification après vérification des variables. Erreur: ${error.message}`
    handler = () => {
      return new Response(responseBody, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }
  }
}

export { handler as GET, handler as POST }
