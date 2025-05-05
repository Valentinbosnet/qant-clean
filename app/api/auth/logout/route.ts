import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // Supprimer tous les cookies d'authentification
    cookieStore.delete("app-session")
    cookieStore.delete("has-subscription")
    cookieStore.delete("user-info")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 })
  }
}
