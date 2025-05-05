import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Starting session refresh process")

    // Get current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the latest user data from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    })

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Current user status in database:", {
      emailVerified: !!user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
    })

    // Return the latest user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
