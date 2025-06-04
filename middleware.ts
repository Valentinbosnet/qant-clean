import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Liste des chemins qui nécessitent une authentification
const protectedPaths = ["/profile", "/favorites", "/notes", "/prediction-alerts", "/alerts", "/settings"]

// Liste des chemins publics (pas besoin d'authentification)
const publicPaths = ["/", "/auth", "/search", "/api"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si le chemin est protégé
  const isPathProtected = protectedPaths.some((path) => pathname.startsWith(path))
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Si le chemin n'est pas protégé, continuer normalement
  if (!isPathProtected || isPublicPath) {
    return NextResponse.next()
  }

  // Récupérer le token de session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si l'utilisateur n'est pas authentifié et que le chemin est protégé,
  // rediriger vers la page de connexion
  if (!token && isPathProtected) {
    const url = new URL("/auth", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Continuer normalement si l'utilisateur est authentifié
  return NextResponse.next()
}

export const config = {
  // Matcher pour les chemins qui déclenchent le middleware
  matcher: [
    "/profile", // Protège la page de profil
    "/favorites", // Ajoutez d'autres routes à protéger ici:
    "/notes",
    "/prediction-alerts",
    "/alerts",
    "/settings",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
