import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Définir les chemins publics qui ne nécessitent pas d'authentification
const publicPaths = [
  "/login",
  "/register",
  "/api/auth",
  "/verify-email",
  "/pricing",
  "/api/stripe",
  "/api/dev",
  "/favicon.ico",
  "/debug",
  "/api/debug",
]

// Définir les chemins qui nécessitent un abonnement
const subscriptionPaths = [
  "/real-time-predictions",
  "/progressive-analysis",
  "/api/real-time-predictions",
  "/api/progressive-analysis",
]

// Fonction pour vérifier si un chemin est public
function isPublicPath(path: string): boolean {
  return publicPaths.some((publicPath) => path.startsWith(publicPath))
}

// Fonction pour vérifier si un chemin nécessite un abonnement
function requiresSubscription(path: string): boolean {
  return subscriptionPaths.some((subscriptionPath) => path.startsWith(subscriptionPath))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ajouter des logs pour le débogage
  console.log(`Middleware: Traitement de la requête pour ${pathname}`)

  // Ignorer les requêtes pour les fichiers statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Permettre l'accès aux chemins publics
  if (isPublicPath(pathname)) {
    console.log(`Middleware: Chemin public ${pathname}, accès autorisé`)
    return NextResponse.next()
  }

  // Vérifier si l'utilisateur est authentifié
  const sessionCookie = request.cookies.get("app-session")

  console.log(`Middleware: Vérification du cookie app-session: ${sessionCookie ? "présent" : "absent"}`)

  // Si pas de cookie de session, rediriger vers la page de connexion
  if (!sessionCookie?.value) {
    console.log(`Middleware: Pas de cookie app-session, redirection vers login`)
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Vérifier si l'utilisateur a un abonnement
  const subscriptionCookie = request.cookies.get("has-subscription")
  console.log(`Middleware: Vérification du cookie has-subscription: ${subscriptionCookie ? "présent" : "absent"}`)

  // Si l'utilisateur n'a pas d'abonnement et essaie d'accéder au tableau de bord, le rediriger vers la page de tarification
  if ((pathname === "/dashboard" || pathname === "/") && !pathname.includes("subscription=success")) {
    if (subscriptionCookie) {
      try {
        const subscriptionData = JSON.parse(subscriptionCookie.value)
        console.log(`Middleware: État de l'abonnement:`, subscriptionData)

        if (!subscriptionData.active) {
          console.log(`Middleware: Pas d'abonnement actif, redirection vers pricing`)
          return NextResponse.redirect(new URL("/pricing", request.url))
        }
      } catch (error) {
        console.error(`Middleware: Erreur lors du parsing du cookie has-subscription:`, error)
        // En cas d'erreur, rediriger vers la page de tarification par précaution
        return NextResponse.redirect(new URL("/pricing", request.url))
      }
    } else {
      console.log(`Middleware: Pas de cookie has-subscription, redirection vers pricing`)
      return NextResponse.redirect(new URL("/pricing", request.url))
    }
  }

  // Vérifier si le chemin nécessite un abonnement
  if (requiresSubscription(pathname)) {
    // Vérifier si l'utilisateur a un abonnement
    if (subscriptionCookie) {
      try {
        const subscriptionData = JSON.parse(subscriptionCookie.value)
        // Autoriser l'accès si l'abonnement est actif ou si le plan est "free"
        if (!subscriptionData.active && subscriptionData.plan !== "free") {
          console.log(`Middleware: Chemin nécessitant un abonnement, pas d'abonnement actif, redirection vers pricing`)
          const pricingUrl = new URL("/pricing", request.url)
          pricingUrl.searchParams.set("redirect", pathname)
          return NextResponse.redirect(pricingUrl)
        }
      } catch (error) {
        console.error(`Middleware: Erreur lors du parsing du cookie has-subscription:`, error)
        // En cas d'erreur, rediriger vers la page de tarification par précaution
        const pricingUrl = new URL("/pricing", request.url)
        pricingUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(pricingUrl)
      }
    } else {
      console.log(
        `Middleware: Chemin nécessitant un abonnement, pas de cookie has-subscription, redirection vers pricing`,
      )
      const pricingUrl = new URL("/pricing", request.url)
      pricingUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(pricingUrl)
    }
  }

  // Permettre l'accès à toutes les autres routes pour les utilisateurs authentifiés
  console.log(`Middleware: Utilisateur authentifié, accès autorisé à ${pathname}`)
  return NextResponse.next()
}

// Configurer le middleware pour s'exécuter sur toutes les routes sauf les API NextAuth
export const config = {
  matcher: ["/((?!api/auth/\\[...nextauth\\]).*)"],
}
