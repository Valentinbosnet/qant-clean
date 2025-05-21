import type { Session, User, AuthError } from "@supabase/supabase-js"

// Type pour l'état d'authentification
export type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isClient: boolean
}

// Type pour les fonctions d'authentification
export type AuthFunctions = {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>
}

// Type complet pour le contexte d'authentification
export type AuthContextType = AuthState & AuthFunctions

// Type pour les résultats d'authentification
export type AuthResult<T = void> = {
  data: T | null
  error: AuthError | null
}

// Type pour les états de rendu de l'authentification
export type AuthRenderState = { type: "loading" } | { type: "authenticated"; user: User } | { type: "unauthenticated" }

// Type pour les métadonnées utilisateur
export interface UserMetadata {
  name?: string
  full_name?: string
  avatar_url?: string
  email?: string
  [key: string]: any
}

// Type pour l'utilisateur avec métadonnées typées
export interface TypedUser extends Omit<User, "user_metadata"> {
  user_metadata: UserMetadata
}

// Type pour les options de connexion
export interface SignInOptions {
  redirectTo?: string
  captchaToken?: string
  emailRedirectTo?: string
}

// Type pour les options d'inscription
export interface SignUpOptions extends SignInOptions {
  data?: Record<string, any>
  emailConfirm?: boolean
}
