import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Starting onboarding completion process")

    // Get current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("User ID:", session.user.id)
    console.log("Email:", session.user.email)

    // Récupérer l'état actuel de l'utilisateur pour le débogage
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    })

    console.log("Current user state:", currentUser)

    // Mettre à jour l'utilisateur pour marquer l'onboarding comme complété
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
      },
      select: {
        id: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    })

    console.log("User updated successfully:", updatedUser)

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      previousState: currentUser,
      currentState: updatedUser,
    })
  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
