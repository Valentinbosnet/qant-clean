import { NextResponse } from "next/server"
import { sectorEmailService } from "@/lib/sector-email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required",
        },
        { status: 400 },
      )
    }

    // Envoyer un email de test
    const success = await sectorEmailService.sendTestSectorAlertEmail(email)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully (mock mode)",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
