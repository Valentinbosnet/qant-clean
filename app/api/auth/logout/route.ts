import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Clear all authentication cookies
    const cookieStore = cookies()

    // List of cookies to clear
    const authCookies = [
      "app-session",
      "next-auth.session-token",
      "next-auth.callback-url",
      "next-auth.csrf-token",
      "has-subscription",
      "user-info",
    ]

    // Clear each cookie
    for (const cookieName of authCookies) {
      cookieStore.delete(cookieName)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
