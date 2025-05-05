import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { TABLES } from "@/lib/db/schema"

// Create a Supabase client with service role for admin operations
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { adminEmail, adminPassword } = await request.json()

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Admin email and password are required" }, { status: 400 })
    }

    // Check if admin user already exists
    const { data: existingAdmins } = await supabase.from(TABLES.USERS).select("id").eq("is_admin", true).limit(1)

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 400 })
    }

    // Create admin user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Skip email verification for admin
      user_metadata: { name: "Admin User" },
    })

    if (authError) {
      console.error("Error creating admin user in auth:", authError)
      return NextResponse.json({ error: authError.message || "Failed to create admin user" }, { status: 500 })
    }

    // Update the user record to mark as admin
    const { error: updateError } = await supabase
      .from(TABLES.USERS)
      .update({
        is_admin: true,
        email_verified: true,
        subscription_tier: "pro",
        subscription_status: "active",
        onboarding_completed: true,
        api_quota: 1000,
        api_usage: 0,
      })
      .eq("id", authData.user.id)

    if (updateError) {
      console.error("Error updating admin user:", updateError)
      return NextResponse.json({ error: "Failed to set admin privileges" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Init admin error:", error)
    return NextResponse.json({ error: "Failed to initialize admin user" }, { status: 500 })
  }
}
