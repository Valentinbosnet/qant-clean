import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Configuré" : "Non configuré",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configuré" : "Non configuré",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configuré" : "Non configuré",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configuré" : "Non configuré",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Configuré" : "Non configuré",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Configuré" : "Non configuré",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "Configuré" : "Non configuré",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? "Configuré" : "Non configuré",
    EMAIL_SERVICE: process.env.EMAIL_SERVICE ? "Configuré" : "Non configuré",
    MAILJET_API_KEY: process.env.MAILJET_API_KEY ? "Configuré" : "Non configuré",
    MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY ? "Configuré" : "Non configuré",
    MAILJET_SENDER: process.env.MAILJET_SENDER ? "Configuré" : "Non configuré",
  }

  return NextResponse.json(envVars)
}
