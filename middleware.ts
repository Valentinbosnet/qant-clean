import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Version minimale du middleware qui ne bloque rien
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Configuration minimale
export const config = {
  matcher: [
    // Exclure les fichiers statiques et les API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
