import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
// Importez d'autres providers si nécessaire (GitHub, Credentials, etc.)

// --- Récupération et Validation des Variables d'Environnement ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
const NEXTAUTH_URL = process.env.NEXTAUTH_URL // Important pour les redirections, surtout en production

console.log("--- Configuration NextAuth API Route ---")
console.log("NEXTAUTH_URL (depuis env):", NEXTAUTH_URL)
console.log("NEXTAUTH_SECRET est défini:", !!NEXTAUTH_SECRET, "(Longueur:", NEXTAUTH_SECRET?.length || 0, ")")
console.log("GOOGLE_CLIENT_ID est défini:", !!GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET est défini:", !!GOOGLE_CLIENT_SECRET)

const providers = [
  // Assurez-vous que les variables sont bien présentes avant d'instancier le provider
  ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  // Ajoutez d'autres providers ici
  // GithubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
]

if (!NEXTAUTH_SECRET) {
  console.error(
    "[ERREUR_AUTH_CRITIQUE] NEXTAUTH_SECRET n'est pas défini. NextAuth ne fonctionnera pas correctement. Ceci est une cause fréquente de CLIENT_FETCH_ERROR en production. Veuillez le définir dans vos variables d'environnement Vercel.",
  )
} else if (NEXTAUTH_SECRET.length < 32) {
  console.warn(
    `[AVERTISSEMENT_AUTH] NEXTAUTH_SECRET est défini mais pourrait être trop court (longueur: ${NEXTAUTH_SECRET.length}). Un secret fort d'au moins 32 caractères est fortement recommandé.`,
  )
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "[ERREUR_AUTH_CRITIQUE] GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET n'est pas défini. Le provider Google ne fonctionnera pas. Veuillez les définir dans vos variables d'environnement Vercel.",
  )
}

export const authOptions: NextAuthOptions = {
  providers: providers,
  secret: NEXTAUTH_SECRET, // Indispensable pour la production et les JWT
  pages: {
    signIn: "/auth/signin", // Page de connexion personnalisée (à créer)
    // error: '/auth/error', // Page d'erreur d'authentification personnalisée (optionnel)
  },
  session: {
    strategy: "jwt", // Recommandé pour App Router si pas de base de données pour les sessions
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persiste l'ID utilisateur et le token d'accès (si OAuth) dans le JWT
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Ajoute l'ID utilisateur à l'objet session côté client
      if (session.user && token.sub) {
        // token.sub est l'ID utilisateur dans le JWT
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
  // Active les logs de débogage de NextAuth en développement
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(`[NEXTAUTH_ROUTE_LOGGER_ERROR] Code: ${code}`, metadata)
      if (metadata instanceof Error) {
        console.error("[NEXTAUTH_ROUTE_LOGGER_ERROR] Détails:", {
          name: metadata.name,
          message: metadata.message,
          stack: metadata.stack,
        })
      }
    },
    warn(code) {
      console.warn(`[NEXTAUTH_ROUTE_LOGGER_WARN] Code: ${code}`)
    },
  },
}

let handler: any
try {
  if (!NEXTAUTH_SECRET || providers.length === 0) {
    console.error(
      "[ERREUR_AUTH_FATALE] Initialisation de NextAuth impossible: NEXTAUTH_SECRET manquant ou aucun provider configuré avec succès.",
    )
    throw new Error("NextAuth configuration incomplete for initialization.")
  }
  console.log("[INFO_AUTH] Initialisation du handler NextAuth...")
  handler = NextAuth(authOptions)
  console.log("[INFO_AUTH] Handler NextAuth initialisé avec succès.")
} catch (error) {
  console.error("[ERREUR_AUTH_FATALE] Échec de l'initialisation de NextAuth(authOptions):", error)
  // Handler de secours en cas d'échec critique de l'initialisation
  handler = () => {
    return new Response(
      "Erreur interne du serveur: Échec de l'initialisation de l'authentification. Vérifiez les logs serveur.",
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      },
    )
  }
  console.log("[INFO_AUTH] Utilisation du handler de secours suite à une erreur d'initialisation.")
}

export { handler as GET, handler as POST }
