import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "./db"

export const authOptions: NextAuthOptions = {
  debug: false, // Désactiver le mode debug
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Vérifier si l'utilisateur existe et si son email est vérifié
          const { data: userData, error: userError } = await supabaseAdmin
            .from("app_users")
            .select("id, email, email_verified")
            .eq("email", credentials.email)
            .single()

          if (userError || !userData) {
            console.error("Utilisateur non trouvé:", userError)
            return null
          }

          if (!userData.email_verified) {
            console.error("Email non vérifié pour:", credentials.email)
            return null
          }

          // Authentifier avec Supabase Auth
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            console.error("Erreur d'authentification:", error)
            return null
          }

          return {
            id: userData.id,
            email: data.user.email,
            emailVerified: userData.email_verified,
          }
        } catch (error) {
          console.error("Erreur lors de l'authentification:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.emailVerified = user.emailVerified
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/logout",
  },
}
