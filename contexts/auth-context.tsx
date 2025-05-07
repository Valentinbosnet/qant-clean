"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/client-supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  isAuthenticated: boolean
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) return

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Erreur lors de la récupération de la session:", error)
        return
      }

      setSession(session)
      setUser(session?.user || null)
      setIsAuthenticated(!!session)
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error)
    }
  }

  useEffect(() => {
    if (!isClient) return

    const fetchSession = async () => {
      setIsLoading(true)
      try {
        await refreshSession()
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const supabase = getClientSupabase()
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsAuthenticated(!!session)
      setIsLoading(false)

      // Afficher des notifications en fonction des événements d'authentification
      if (_event === "SIGNED_IN") {
        toast({
          title: "Connecté",
          description: "Vous êtes maintenant connecté",
        })
      } else if (_event === "SIGNED_OUT") {
        toast({
          title: "Déconnecté",
          description: "Vous avez été déconnecté avec succès",
        })
      } else if (_event === "USER_UPDATED") {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour",
        })
      } else if (_event === "PASSWORD_RECOVERY") {
        toast({
          title: "Récupération de mot de passe",
          description: "Suivez les instructions pour réinitialiser votre mot de passe",
        })
      } else if (_event === "USER_DELETED") {
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès",
          variant: "destructive",
        })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [isClient, toast])

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.session) {
        // Mettre à jour l'état immédiatement après une connexion réussie
        setSession(data.session)
        setUser(data.user)
        setIsAuthenticated(true)
      }

      return { error }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err)
      return { error: err as AuthError }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        return { data: null, error: { message: "Client Supabase non disponible" } as AuthError }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { data, error }
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err)
      return { data: null, error: err as AuthError }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { error }
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) return

      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  // Valeurs par défaut pour le rendu côté serveur
  const defaultContextValue: AuthContextType = {
    user: null,
    session: null,
    isLoading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => {},
    refreshSession: async () => {},
    isAuthenticated: false,
    resendVerificationEmail: async () => ({ error: null }),
  }

  // Si nous ne sommes pas côté client, retourner les valeurs par défaut
  if (!isClient) {
    return <AuthContext.Provider value={defaultContextValue}>{children}</AuthContext.Provider>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        isAuthenticated,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
