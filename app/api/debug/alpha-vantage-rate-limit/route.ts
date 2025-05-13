import { getRateLimitStatus } from "@/actions/stock-api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const status = await getRateLimitStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking rate limit status:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Une erreur s'est produite",
      },
      { status: 500 },
    )
  }
}
