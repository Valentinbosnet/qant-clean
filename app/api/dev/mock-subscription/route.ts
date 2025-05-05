import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the plan from the request body
    const { plan } = await request.json()

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 })
    }

    // Set cookies to indicate the user has a subscription
    const cookieStore = cookies()

    // Set subscription cookie
    cookieStore.set("has-subscription", "true", {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Set user info cookie with subscription details
    const userInfo = {
      subscription: {
        status: "active",
        plan,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }

    cookieStore.set("user-info", JSON.stringify(userInfo), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan} plan`,
      subscription: userInfo.subscription,
    })
  } catch (error) {
    console.error("Error creating mock subscription:", error)
    return NextResponse.json({ error: "Failed to create mock subscription" }, { status: 500 })
  }
}
