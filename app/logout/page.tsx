"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      // Attendre un court instant pour s'assurer que tout est chargé
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Déconnexion complète
      await signOut({ callbackUrl: "/login" })
    }

    performLogout()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Déconnexion en cours...</h1>
        <p className="text-gray-400">Vous allez être redirigé vers la page de connexion.</p>
      </div>
    </div>
  )
}
