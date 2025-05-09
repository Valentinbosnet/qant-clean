import { NextResponse } from "next/server"
import { getApiStatus } from "@/actions/api-keys"

export async function GET() {
  // Utiliser l'action serveur pour obtenir le statut des API
  const status = await getApiStatus()

  return NextResponse.json(status)
}
