import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  // Check if request is authorized
  const authorization = request.headers.get("authorization")
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only admins can access this endpoint
  const token = authorization.substring(7)
  const { data: session, error: sessionError } = await adminClient.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  // Check if user is an admin
  const { data: user, error: userError } = await adminClient
    .from("users")
    .select("is_admin")
    .eq("id", session.session?.user.id)
    .single()

  if (userError || !user || !user.is_admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const { email, subject, message, template } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Email, subject, and message are required" }, { status: 400 })
    }

    // Send email with the specified template or a default one
    const result = await sendEmail({
      to: email,
      subject,
      body: template ? message : `<div style="font-family: Arial, sans-serif; padding: 20px;">${message}</div>`,
      template: template as any,
    })

    // Log the test email in the database for auditing
    await adminClient.from("email_logs").insert({
      to: email,
      subject,
      content: message,
      sent_by: session.session?.user.id,
      sent_at: new Date().toISOString(),
      success: true,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("Error sending test email:", error)

    // Log the failure
    const { email, subject, message } = await request
      .json()
      .catch(() => ({ email: "unknown", subject: "unknown", message: "unknown" }))

    await adminClient.from("email_logs").insert({
      to: email,
      subject,
      content: message,
      sent_by: session.session?.user.id,
      sent_at: new Date().toISOString(),
      success: false,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to send email: " + error.message }, { status: 500 })
  }
}
