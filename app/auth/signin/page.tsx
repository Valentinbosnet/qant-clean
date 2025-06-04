"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation" // Correction: utiliser next/navigation pour App Router
import { useEffect } from "react"
import { Button } from "@/components/ui/button" // Assurez-vous d'avoir ce composant

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile") // Redirige vers le profil si déjà connecté
    }
  }, [status, router])

  if (status === "loading") {
    return <p>Chargement de la session...</p>
  }

  if (status === "authenticated") {
    return <p>Vous êtes déjà connecté. Redirection...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Connectez-vous à Stock Dashboard</h1>
        <div className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/profile" })}
            variant="outline"
            className="w-full max-w-xs"
          >
            Se connecter avec Google
          </Button>
          {/* Ajoutez d'autres boutons de connexion pour d'autres providers ici */}
          {/* Exemple pour GitHub:
          <Button
            onClick={() => signIn("github", { callbackUrl: "/profile" })}
            variant="outline"
            className="w-full max-w-xs"
          >
            Se connecter avec GitHub
          </Button>
          */}
        </div>
        <p className="mt-8 text-sm text-gray-600">
          En vous connectant, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </main>
    </div>
  )
}
