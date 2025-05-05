import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Version simplifiée qui autorise toujours
        return { id: "1", name: "User", email: "user@example.com" }
      },
    }),
  ],
  session: { strategy: "jwt" },
}

export async function verifyEmail() {
  return true
}
