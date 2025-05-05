"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

export default function AuthRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const destination = searchParams.get("destination") || "/dashboard"
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Tenter de se connecter automatiquement
        const result = await signIn("credentials", {
          redirect: false,
          callbackUrl: destination,
        })

        if (result?.error) {
          console.error("Erreur de connexion:", result.error)
          setError("Erreur lors de la connexion automatique. Redirection vers la page de connexion...")

          // En cas d'erreur, rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push(`/login?callbackUrl=${encodeURIComponent(destination)}`)
          }, 3000)
        } else {
          // Redirection réussie
          router.push(destination)
        }
      } catch (error) {
        console.error("Erreur lors de la redirection:", error)
        setError("Une erreur s'est produite. Redirection vers la page de connexion...")

        // En cas d'erreur, rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push(`/login?callbackUrl=${encodeURIComponent(destination)}`)
        }, 3000)
      }
    }

    handleRedirect()
  }, [destination, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 text-center text-white shadow-lg">
        {error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />
            <h1 className="mt-4 text-xl font-semibold">Redirection en cours...</h1>
            <p className="mt-2 text-gray-400">Vous allez être redirigé automatiquement.</p>
          </>
        )}
      </div>
    </div>
  )
}
