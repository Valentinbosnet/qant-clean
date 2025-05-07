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
    console.log("AuthProvider monté côté client")
  }, [])

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      console.log("Rafraîchissement de la session...")
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("Client Supabase non disponible")
        return
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Erreur lors de la récupération de la session:", error)
        return
      }

      console.log("Session récupérée:", session ? "Valide" : "Nulle")
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

    console.log("Initialisation de la session...")
    fetchSession()

    const supabase = getClientSupabase()
    if (!supabase) {
      console.error("Client Supabase non disponible pour les événements d'authentification")
      return
    }

    console.log("Configuration des écouteurs d'événements d'authentification")
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Événement d'authentification:", _event)
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
      console.log("Nettoyage des écouteurs d'événements d'authentification")
      subscription?.unsubscribe()
    }
  }, [isClient, toast])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentative de connexion avec:", email)
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("Client Supabase non disponible pour la connexion")
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("Appel à supabase.auth.signInWithPassword")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erreur de connexion:", error)
        return { error }
      }

      console.log("Connexion réussie, session:", data.session ? "Valide" : "Nulle")
      if (!error && data.session) {
        // Mettre à jour l'état immédiatement après une connexion réussie
        setSession(data.session)
        setUser(data.user)
        setIsAuthenticated(true)
      }

      return { error: null }
    } catch (err) {
      console.error("Exception lors de la connexion:", err)
      return { error: err as AuthError }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Tentative d'inscription avec:", email)
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("Client Supabase non disponible pour l'inscription")
        return { data: null, error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("Appel à supabase.auth.signUp")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Erreur d'inscription:", error)
      } else {
        console.log("Inscription réussie, vérification d'email requise")
      }

      return { data, error }
    } catch (err) {
      console.error("Exception lors de l'inscription:", err)
      return { data: null, error: err as AuthError }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log("Tentative de renvoi d'email de vérification pour:", email)
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("Client Supabase non disponible pour le renvoi d'email")
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("Appel à supabase.auth.resend")
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Erreur lors du renvoi d'email:", error)
      } else {
        console.log("Email de vérification renvoyé avec succès")
      }

      return { error }
    } catch (err) {
      console.error("Exception lors de l'envoi de l'email de vérification:", err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    try {
      console.log("Tentative de déconnexion")
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("Client Supabase non disponible pour la déconnexion")
        return
      }

      console.log("Appel à supabase.auth.signOut")
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      console.log("Déconnexion réussie")
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
    console.log("Rendu côté serveur, utilisation des valeurs par défaut")
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
