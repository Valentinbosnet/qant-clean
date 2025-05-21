"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

// Type pour les props du composant
interface UserMenuProps {
  showAvatar?: boolean
  showName?: boolean
  variant?: "default" | "compact" | "full"
}

export function UserMenu({
  showAvatar = true,
  showName = true,
  variant = "default",
}: UserMenuProps): JSX.Element | null {
  // États locaux
  const [mounted, setMounted] = useState<boolean>(false)

  // Récupération du contexte d'authentification avec l'utilisateur typé
  const { user, signOut, isAuthenticated, isLoading, isClient } = useAuth(true)

  // Mémoriser le nom d'utilisateur pour éviter des recalculs inutiles
  const displayName = useMemo((): string => {
    if (!user) return "Utilisateur"

    // Accès sécurisé aux métadonnées de l'utilisateur
    const metadata = user.user_metadata || {}

    if (metadata.full_name) return metadata.full_name
    if (metadata.name) return metadata.name
    if (user.email) return user.email.split("@")[0]

    return "Utilisateur"
  }, [user])

  // Mémoriser l'URL de l'avatar pour éviter des recalculs inutiles
  const avatarUrl = useMemo((): string => {
    if (!user) return ""

    // Accès sécurisé aux métadonnées de l'utilisateur
    const metadata = user.user_metadata || {}

    return metadata.avatar_url || ""
  }, [user])

  // Mémoriser les initiales pour l'avatar pour éviter des recalculs inutiles
  const initials = useMemo((): string => {
    if (!user) return "U"

    // Accès sécurisé aux métadonnées de l'utilisateur
    const metadata = user.user_metadata || {}

    if (metadata.full_name) {
      const parts = metadata.full_name.split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return metadata.full_name.substring(0, 2).toUpperCase()
    }

    if (user.email) {
      const parts = user.email.split(/[@\s]+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return user.email.substring(0, 2).toUpperCase()
    }

    return "U"
  }, [user])

  // Fonction de déconnexion optimisée avec useCallback
  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      await signOut()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }, [signOut])

  // Effet pour marquer le composant comme monté
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mémoriser l'état d'affichage du menu pour éviter des recalculs inutiles
  const showMenu = useMemo((): boolean => {
    return mounted && !isLoading && isAuthenticated && user !== null
  }, [mounted, isLoading, isAuthenticated, user])

  // Mémoriser le contenu du menu pour éviter des recréations inutiles
  const menuContent = useMemo(
    () => (
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    ),
    [handleSignOut],
  )

  // Si le composant n'est pas monté ou si l'utilisateur n'est pas authentifié, ne rien afficher
  if (!showMenu) {
    return null
  }

  // Rendu du menu utilisateur
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {showAvatar && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
          {showName && <span>{displayName}</span>}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  )
}
