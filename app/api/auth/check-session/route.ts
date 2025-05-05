import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("app-session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false, error: "Pas de session" }, { status: 401 })
    }

    const { valid, user, error } = await verifySession(sessionCookie.value)

    if (!valid) {
      return NextResponse.json({ authenticated: false, error }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error)
    return NextResponse.json(
      { authenticated: false, error: "Erreur lors de la vérification de la session" },
      { status: 500 },
    )
  }
}
