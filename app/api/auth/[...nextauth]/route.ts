import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials" // Using only Credentials for extreme simplification

// --- Environment Variable Retrieval & Validation ---
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
const VERCEL_URL = process.env.VERCEL_URL
const NEXTAUTH_URL_USER_DEFINED = process.env.NEXTAUTH_URL

let effectiveNextAuthUrl = NEXTAUTH_URL_USER_DEFINED
if (!effectiveNextAuthUrl && VERCEL_URL) {
  effectiveNextAuthUrl = `https://${VERCEL_URL}`
}

console.log("--- NextAuth API Route Initialization (EXTREME SIMPLIFICATION DEBUG) ---")
console.log("Effective NEXTAUTH_URL for cookies/redirects:", effectiveNextAuthUrl)
console.log("NEXTAUTH_SECRET is set:", !!NEXTAUTH_SECRET, "(Length:", NEXTAUTH_SECRET?.length || 0, ")")

if (!NEXTAUTH_SECRET) {
  console.error(
    "[AUTH_ERROR] CRITICAL: NEXTAUTH_SECRET IS NOT DEFINED. This is the most common cause of session errors. Please set this in your Vercel project environment variables with a strong, random string (32+ chars).",
  )
} else if (NEXTAUTH_SECRET.length < 32) {
  console.warn(
    `[AUTH_WARN] NEXTAUTH_SECRET (length: ${NEXTAUTH_SECRET.length}) may be too short. A strong secret of at least 32 characters is highly recommended. An insufficiently random secret can lead to security vulnerabilities and runtime errors.`,
  )
}

const isProduction = process.env.NODE_ENV === "production"

// EXTREMELY SIMPLIFIED authOptions for debugging
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "DiagnosticsCredentials", // Using a distinct name for this test
      credentials: {
        username: { label: "Username", type: "text", placeholder: "testuser" },
      },
      async authorize(credentials) {
        // This authorize function will likely not be hit during a /api/auth/session call
        // but is required for the CredentialsProvider.
        // For this test, we can just return a mock user if needed for other flows.
        if (credentials?.username === "testuser") {
          console.log("[AUTH_DIAGNOSTICS_CREDENTIALS] Authorize called for testuser (should not happen for /session).")
          return { id: "diagnostic-user-123", name: "Diagnostic User" }
        }
        return null
      },
    }),
  ],
  secret: NEXTAUTH_SECRET, // This is paramount.
  session: {
    strategy: "jwt", // Explicitly JWT
  },
  // Using minimal callbacks for diagnostics
  callbacks: {
    async jwt({ token, user }) {
      // console.log("[AUTH_DIAGNOSTICS_JWT] Invoked. User ID:", user?.id);
      if (user?.id) {
        token.sub = user.id // 'sub' is standard for subject/user ID in JWT
      }
      return token
    },
    async session({ session, token }) {
      // console.log("[AUTH_DIAGNOSTICS_SESSION] Invoked. Token sub:", token?.sub);
      if (session?.user && token?.sub) {
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
  // Minimal pages configuration
  pages: {
    // signIn: '/auth', // Not strictly needed for /api/auth/session test
    // error: '/auth/error', // Can be added later
  },
  // Secure cookies for production
  cookies: {
    sessionToken: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  // Basic logger to still catch the CLIENT_FETCH_ERROR if it occurs
  logger: {
    error(code, metadata) {
      console.error(`[NEXTAUTH_SIMPLIFIED_LOGGER_ERROR] Code: ${code}`, metadata)
      if (metadata instanceof Error) {
        console.error("[NEXTAUTH_SIMPLIFIED_LOGGER_ERROR] Details:", {
          name: metadata.name,
          message: metadata.message,
          stack: metadata.stack,
        })
      } else if (typeof metadata === "object" && metadata !== null && "error" in metadata) {
        const nestedError = (metadata as any).error
        console.error("[NEXTAUTH_SIMPLIFIED_LOGGER_ERROR] Nested Error (raw):", nestedError)
      }
    },
    warn(code) {
      console.warn(`[NEXTAUTH_SIMPLIFIED_LOGGER_WARN] Code: ${code}`)
    },
  },
  debug: false, // Keep debug off for this simplified test unless absolutely necessary for Vercel logs
  ...(effectiveNextAuthUrl && { url: effectiveNextAuthUrl }),
}

let handler: any
try {
  console.log("[AUTH_INIT_SIMPLIFIED] Initializing NextAuth handler with EXTREMELY simplified options...")
  handler = NextAuth(authOptions)
  console.log("[AUTH_INIT_SIMPLIFIED] NextAuth handler initialized.")
} catch (error) {
  console.error(
    "[AUTH_ERROR_SIMPLIFIED] CRITICAL: NextAuth(authOptions) FAILED TO INITIALIZE even with simplified config:",
    error,
  )
  handler = (req: Request, res: Response) =>
    new Response("Internal Server Error: NextAuth failed during simplified critical initialization.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
}

export { handler as GET, handler as POST }
