import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      emailVerified: Date | null
      onboardingCompleted: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    emailVerified: Date | null
    onboardingCompleted: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    emailVerified: Date | null
    onboardingCompleted: boolean
  }
}
