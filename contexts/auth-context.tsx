"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/client-supabase"
import { isOfflineMode, signOutOfflineUser, authenticateOfflineUser, getOfflineUser } from "@/lib/offline-mode"

// Définition claire des types pour éviter les erreurs
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  isClient: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>
}

// Valeurs par défaut sécurisées pour le contexte
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  isClient: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  refreshSession: async () => {},
  resendVerificationEmail: async () => ({ error: null }),
}

// Création du contexte avec les valeurs par défaut
const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // États avec des types explicites
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const initAttempts = useRef<number>(0)
  const maxInitAttempts = 3
  const { toast } = useToast()

  // Fonction pour rafraîchir la session avec useCallback pour éviter les recréations inutiles
  const refreshSession = useCallback(async (): Promise<void> => {
    console.log("AuthProvider - refreshSession appelé")

    try {
      // Vérifier si nous sommes en mode hors ligne
      if (isOfflineMode()) {
        console.log("AuthProvider - Mode hors ligne détecté dans refreshSession")
        const offlineUser = getOfflineUser()
        if (offlineUser) {
          setUser(offlineUser as any)
          setIsAuthenticated(true)
        }
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("AuthProvider - Client Supabase non disponible")
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      console.log("AuthProvider - Récupération de la session")
      const {
        data: { session: newSession },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("AuthProvider - Erreur lors de la récupération de la session:", error)
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      console.log("AuthProvider - Session récupérée:", newSession ? "Valide" : "Nulle")

      // Mise à jour sécurisée des états
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsAuthenticated(!!newSession)
      setIsLoading(false)
      setIsInitialized(true)
    } catch (error) {
      console.error("AuthProvider - Exception lors du rafraîchissement de la session:", error)
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [])

  // Effet pour détecter le client et initialiser la session
  useEffect(() => {
    console.log("AuthProvider - useEffect pour détecter le client")
    setIsClient(true)
  }, [])

  // Effet pour initialiser la session une fois que nous sommes côté client
  useEffect(() => {
    if (!isClient) {
      console.log("AuthProvider - Pas encore côté client, skip de l'initialisation")
      return
    }

    console.log("AuthProvider - Initialisation de la session côté client")

    const initSession = async (): Promise<void> => {
      try {
        await refreshSession()
      } catch (error) {
        console.error("AuthProvider - Erreur lors de l'initialisation de la session:", error)

        // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer
        if (initAttempts.current < maxInitAttempts) {
          initAttempts.current += 1
          console.log(`AuthProvider - Nouvelle tentative (${initAttempts.current}/${maxInitAttempts})`)

          // Attendre un peu avant de réessayer
          setTimeout(initSession, 1000)
          return
        }

        // Si nous avons atteint le nombre maximum de tentatives, abandonner
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initSession()

    // Configuration des écouteurs d'événements d'authentification
    const supabase = getClientSupabase()
    if (!supabase) {
      console.error("AuthProvider - Client Supabase non disponible pour les événements d'authentification")
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    console.log("AuthProvider - Configuration des écouteurs d'événements d'authentification")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("AuthProvider - Événement d'authentification:", event)

      // Mise à jour sécurisée des états
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsAuthenticated(!!newSession)
      setIsLoading(false)
      setIsInitialized(true)

      // Afficher des notifications en fonction des événements d'authentification
      if (event === "SIGNED_IN") {
        toast({
          title: "Connecté",
          description: "Vous êtes maintenant connecté",
        })
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Déconnecté",
          description: "Vous avez été déconnecté avec succès",
        })
      } else if (event === "USER_UPDATED") {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour",
        })
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Récupération de mot de passe",
          description: "Suivez les instructions pour réinitialiser votre mot de passe",
        })
      } else if (event === "USER_DELETED") {
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès",
          variant: "destructive",
        })
      }
    })

    // Nettoyage des écouteurs lors du démontage
    return () => {
      console.log("AuthProvider - Nettoyage des écouteurs d'événements d'authentification")
      subscription?.unsubscribe()
    }
  }, [isClient, refreshSession, toast])

  // Fonction de connexion avec useCallback
  const signIn = useCallback(async (email: string, password: string) => {
    console.log("AuthProvider - signIn appelé avec:", email)

    try {
      // Gestion du mode hors ligne
      if (isOfflineMode()) {
        console.log("AuthProvider - Mode hors ligne détecté dans signIn")
        const offlineUser = await authenticateOfflineUser(email, password)

        if (offlineUser) {
          // Création d'une session fictive pour le mode hors ligne
          const offlineSession = {
            access_token: "offline_token",
            token_type: "offline",
            expires_in: 3600,
            refresh_token: "offline_refresh_token",
            user: offlineUser,
          }

          // Mise à jour sécurisée des états
          setUser(offlineUser)
          setSession(offlineSession)
          setIsAuthenticated(true)

          return { error: null }
        } else {
          return { error: { message: "Identifiants invalides" } as AuthError }
        }
      }

      // Connexion normale avec Supabase
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("AuthProvider - Client Supabase non disponible pour la connexion")
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("AuthProvider - Appel à supabase.auth.signInWithPassword")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("AuthProvider - Erreur de connexion:", error)
        return { error }
      }

      console.log("AuthProvider - Connexion réussie, session:", data.session ? "Valide" : "Nulle")

      if (!error && data.session) {
        // Mise à jour sécurisée des états
        setSession(data.session)
        setUser(data.user)
        setIsAuthenticated(true)
      }

      return { error: null }
    } catch (err) {
      console.error("AuthProvider - Exception lors de la connexion:", err)
      return { error: err as AuthError }
    }
  }, [])

  // Fonction d'inscription avec useCallback
  const signUp = useCallback(async (email: string, password: string) => {
    console.log("AuthProvider - signUp appelé avec:", email)

    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("AuthProvider - Client Supabase non disponible pour l'inscription")
        return { data: null, error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("AuthProvider - Appel à supabase.auth.signUp")

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      })

      if (error) {
        console.error("AuthProvider - Erreur d'inscription:", error)
      } else {
        console.log("AuthProvider - Inscription réussie, vérification d'email requise")
      }

      return { data, error }
    } catch (err) {
      console.error("AuthProvider - Exception lors de l'inscription:", err)
      return { data: null, error: err as AuthError }
    }
  }, [])

  // Fonction de renvoi d'email de vérification avec useCallback
  const resendVerificationEmail = useCallback(async (email: string) => {
    console.log("AuthProvider - resendVerificationEmail appelé pour:", email)

    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("AuthProvider - Client Supabase non disponible pour le renvoi d'email")
        return { error: { message: "Client Supabase non disponible" } as AuthError }
      }

      console.log("AuthProvider - Appel à supabase.auth.resend")

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      })

      if (error) {
        console.error("AuthProvider - Erreur lors du renvoi d'email:", error)
      } else {
        console.log("AuthProvider - Email de vérification renvoyé avec succès")
      }

      return { error }
    } catch (err) {
      console.error("AuthProvider - Exception lors de l'envoi de l'email de vérification:", err)
      return { error: err as AuthError }
    }
  }, [])

  // Fonction de déconnexion avec useCallback
  const signOut = useCallback(async () => {
    console.log("AuthProvider - signOut appelé")

    try {
      // Gestion du mode hors ligne
      if (isOfflineMode()) {
        console.log("AuthProvider - Mode hors ligne détecté dans signOut")
        await signOutOfflineUser()

        // Réinitialisation des états
        setUser(null)
        setSession(null)
        setIsAuthenticated(false)

        console.log("AuthProvider - Déconnexion hors ligne réussie")
        return
      }

      // Déconnexion normale avec Supabase
      const supabase = getClientSupabase()
      if (!supabase) {
        console.error("AuthProvider - Client Supabase non disponible pour la déconnexion")
        return
      }

      console.log("AuthProvider - Appel à supabase.auth.signOut")

      await supabase.auth.signOut()

      // Réinitialisation des états
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

      console.log("AuthProvider - Déconnexion réussie")
    } catch (error) {
      console.error("AuthProvider - Erreur lors de la déconnexion:", error)
    }
  }, [])

  // Utilisation de useMemo pour éviter les recréations inutiles de l'objet de contexte
  const contextValue = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isInitialized,
      isAuthenticated,
      isClient,
      signIn,
      signUp,
      signOut,
      refreshSession,
      resendVerificationEmail,
    }),
    [
      user,
      session,
      isLoading,
      isInitialized,
      isAuthenticated,
      isClient,
      signIn,
      signUp,
      signOut,
      refreshSession,
      resendVerificationEmail,
    ],
  )

  // Rendu conditionnel pour le serveur vs client
  if (!isClient) {
    console.log("AuthProvider - Rendu côté serveur, utilisation des valeurs par défaut")
    return <AuthContext.Provider value={defaultContextValue}>{children}</AuthContext.Provider>
  }

  console.log("AuthProvider - Rendu côté client avec valeurs dynamiques")

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }

  return context
}
