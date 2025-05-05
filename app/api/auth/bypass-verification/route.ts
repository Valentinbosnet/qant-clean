import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Vérifier si nous sommes en mode développement
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Cette route n'est disponible qu'en mode développement" }, { status: 403 })
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const email = session.user.email

    // Trouver l'utilisateur
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Marquer l'email comme vérifié
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors du bypass de vérification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
