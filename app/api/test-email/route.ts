import { NextResponse } from "next/server"
import { testEmailConfiguration } from "@/lib/email-test"

export async function GET() {
  try {
    const result = await testEmailConfiguration()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Configuration email testée avec succès",
        details: result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Échec du test de configuration email",
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erreur lors du test de configuration email:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors du test de configuration email",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
