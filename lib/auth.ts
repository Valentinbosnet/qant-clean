import { createClient } from "@supabase/supabase-js"
import type { AuthOptions } from "next-auth"

// This is needed by NextAuth in other parts of the application
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [], // Minimal configuration to avoid conflicts
  session: {
    strategy: "jwt",
  },
  // We're leaving this minimal to avoid conflicts with Supabase auth
}

// Function to verify email
export async function verifyEmail(token: string): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if the code exists and hasn't expired
    const { data, error } = await supabase
      .from("verification_codes")
      .select("user_email")
      .eq("code", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      console.error("Invalid or expired code:", { error, data })
      throw new Error("Invalid or expired code")
    }

    // Get the email
    const email = data.user_email

    // Mark the user as verified
    const { error: updateError } = await supabase.from("app_users").update({ email_verified: true }).eq("email", email)

    if (updateError) {
      console.error("Error updating verification status:", updateError)
      throw new Error("Error updating verification status")
    }

    // Delete the used code
    const { error: deleteError } = await supabase
      .from("verification_codes")
      .delete()
      .eq("user_email", email)
      .eq("code", token)

    if (deleteError) {
      console.warn("Error deleting used code:", deleteError)
      // Don't fail if deletion fails
    }

    return email
  } catch (error: any) {
    console.error("Error verifying email:", error)
    throw new Error(error.message)
  }
}
