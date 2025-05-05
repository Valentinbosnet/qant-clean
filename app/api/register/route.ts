import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role for admin operations
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey).auth

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Create user using Supabase Auth
    const { data, error } = await adminAuthClient.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: { name },
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 })
    }

    // Send email verification (if not automatically sent by Supabase)
    await adminAuthClient.admin.sendEmailVerification({
      email,
    })

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      userId: data.user.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
