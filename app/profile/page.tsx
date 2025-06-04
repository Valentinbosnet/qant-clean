"use client" // Nécessaire pour useSession

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation" // Correction: utiliser next/navigation pour App Router
import { useEffect } from "react"
import { Button } from "@/components/ui/button" // Assurez-vous d'avoir ce composant

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirection si non authentifié (protection côté client)
  // Pour une protection robuste, utilisez le middleware.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <p>Chargement du profil...</p>
  }

  if (status === "unauthenticated") {
    return <p>Vous devez être connecté pour voir cette page. Redirection...</p>
  }

  if (session?.user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profil Utilisateur</h1>
        <p>
          Bienvenue, <span className="font-semibold">{session.user.name || "Utilisateur"}</span>!
        </p>
        <p>Email: {session.user.email}</p>
        <p>ID Utilisateur (depuis JWT): {(session.user as any).id || "Non disponible"}</p>
        {session.user.image && (
          <img
            src={session.user.image || "/placeholder.svg"}
            alt="Avatar utilisateur"
            className="w-20 h-20 rounded-full my-4"
          />
        )}
        <Button onClick={() => signOut({ callbackUrl: "/" })} className="mt-4">
          Se déconnecter
        </Button>
      </div>
    )
  }

  // Fallback au cas où la session est authentifiée mais session.user est manquant (ne devrait pas arriver)
  return <p>Erreur lors du chargement des informations utilisateur.</p>
}
