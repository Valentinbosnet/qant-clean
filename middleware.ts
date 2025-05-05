import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware simple qui ne fait rien
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Configurer le middleware pour s'exécuter uniquement sur certains chemins
export const config = {
  matcher: [
    // Exclure tous les chemins statiques
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
