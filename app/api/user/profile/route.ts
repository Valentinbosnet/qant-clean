import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // In a production app, you would verify the session and fetch user data from your database
    // For now, we'll return mock data

    // Check for authentication cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("app-session") || cookieStore.get("next-auth.session-token")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Mock user data
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      subscription: {
        status: "active",
        plan: "pro",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
