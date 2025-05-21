"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

export function AuthStatusSimple() {
  // Ajout de logs pour le débogage
  useEffect(() => {
    console.log("AuthStatusSimple monté")
    return () => {
      console.log("AuthStatusSimple démonté")
    }
  }, [])

  console.log("AuthStatusSimple rendu")

  // Version simplifiée sans dépendance au contexte d'authentification
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth">Se connecter</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth?tab=signup">S'inscrire</Link>
      </Button>
    </div>
  )
}
