"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">Chargement...</span>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/profile">Mon compte</Link>
      </Button>
    )
  }

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
