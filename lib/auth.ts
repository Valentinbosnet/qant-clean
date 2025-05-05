import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// NextAuth configuration options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a simplified mock implementation
        // In a real app, you would validate against your database
        if (credentials?.email && credentials?.password) {
          return {
            id: "user-1",
            name: "Test User",
            email: credentials.email,
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

// Function to verify email
export async function verifyEmail(token: string): Promise<boolean> {
  // This is a simplified mock implementation
  // In a real app, you would validate the token against your database
  return token.length > 0
}
