import { NextResponse } from "next/server"
import { verifyEmail } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 })
    }

    const email = await verifyEmail(token)

    return NextResponse.json({
      success: true,
      message: `Email ${email} vérifié avec succès`,
      email,
    })
  } catch (error: any) {
    console.error("Erreur de vérification d'email:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la vérification de l'email" }, { status: 400 })
  }
}
