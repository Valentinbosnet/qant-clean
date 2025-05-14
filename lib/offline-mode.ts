"use client"

import { z } from "zod"

// Type pour les utilisateurs hors ligne
interface OfflineUser {
  id: string
  email: string
  created_at: string
  last_sign_in: string
}

// Type pour les jetons d'authentification
interface OfflineAuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Schéma de validation pour l'email et le mot de passe
const emailSchema = z.string().email({ message: "Adresse email invalide" })
const passwordSchema = z
  .string()
  .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
  .max(100, { message: "Le mot de passe est trop long" })

// Clés de stockage local
const OFFLINE_MODE_KEY = "app_offline_mode"
const OFFLINE_USERS_KEY = "app_offline_users"
const OFFLINE_AUTH_TOKEN_KEY = "app_offline_auth_token"
const OFFLINE_CURRENT_USER_KEY = "app_offline_current_user"

// Activer/désactiver le mode hors ligne
export function setOfflineMode(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(enabled))
}

// Vérifier si le mode hors ligne est activé
export function isOfflineModeEnabled(): boolean {
  if (typeof window === "undefined") return false
  const value = localStorage.getItem(OFFLINE_MODE_KEY)
  return value ? JSON.parse(value) : false
}

// Fonction alias pour obtenir l'état du mode hors ligne (ajoutée pour compatibilité)
export function getOfflineMode(): boolean {
  return isOfflineModeEnabled()
}

// Récupérer tous les utilisateurs hors ligne
export function getOfflineUsers(): OfflineUser[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(OFFLINE_USERS_KEY)
  return users ? JSON.parse(users) : []
}

// Ajouter un utilisateur hors ligne
export function addOfflineUser(email: string): OfflineUser {
  if (typeof window === "undefined") throw new Error("Fonction appelée côté serveur")

  try {
    emailSchema.parse(email)
  } catch (error) {
    throw new Error("Email invalide")
  }

  const users = getOfflineUsers()

  // Vérifier si l'utilisateur existe déjà
  const existingUser = users.find((user) => user.email === email)
  if (existingUser) {
    throw new Error("Un compte existe déjà avec cette adresse email")
  }

  // Créer un nouvel utilisateur
  const newUser: OfflineUser = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    email,
    created_at: new Date().toISOString(),
    last_sign_in: new Date().toISOString(),
  }

  // Ajouter l'utilisateur à la liste
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify([...users, newUser]))

  return newUser
}

// Authentifier un utilisateur hors ligne
export function authenticateOfflineUser(email: string, password: string): OfflineUser {
  if (typeof window === "undefined") throw new Error("Fonction appelée côté serveur")

  try {
    emailSchema.parse(email)
    passwordSchema.parse(password)
  } catch (error) {
    throw new Error("Email ou mot de passe invalide")
  }

  const users = getOfflineUsers()
  const user = users.find((user) => user.email === email)

  if (!user) {
    // Dans le mode hors ligne, nous allons créer l'utilisateur s'il n'existe pas
    // Cela simplifie l'expérience utilisateur en mode hors ligne
    const newUser = addOfflineUser(email)
    saveOfflineAuthToken(newUser)
    saveCurrentOfflineUser(newUser)
    return newUser
  }

  // Mettre à jour la dernière connexion
  user.last_sign_in = new Date().toISOString()
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users))

  // Enregistrer les jetons d'authentification et l'utilisateur courant
  saveOfflineAuthToken(user)
  saveCurrentOfflineUser(user)

  return user
}

// Créer et enregistrer un jeton d'authentification hors ligne
function saveOfflineAuthToken(user: OfflineUser): void {
  if (typeof window === "undefined") return

  // Créer des jetons fictifs
  const tokens: OfflineAuthTokens = {
    access_token: `offline_token_${user.id}_${Date.now()}`,
    refresh_token: `offline_refresh_${user.id}_${Date.now()}`,
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // Expire dans 24 heures
  }

  // Enregistrer les jetons localement
  localStorage.setItem(OFFLINE_AUTH_TOKEN_KEY, JSON.stringify(tokens))

  // Également enregistrer dans le format utilisé par Supabase pour la compatibilité
  localStorage.setItem(
    "supabase.auth.token",
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    }),
  )
}

// Enregistrer l'utilisateur courant
function saveCurrentOfflineUser(user: OfflineUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem(OFFLINE_CURRENT_USER_KEY, JSON.stringify(user))
}

// Récupérer l'utilisateur actuellement connecté en mode hors ligne
export function getCurrentOfflineUser(): OfflineUser | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(OFFLINE_CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

// Vérifier si un utilisateur est authentifié en mode hors ligne
export function isOfflineAuthenticated(): boolean {
  return getCurrentOfflineUser() !== null
}

// Déconnecter l'utilisateur hors ligne
export function signOutOfflineUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(OFFLINE_AUTH_TOKEN_KEY)
  localStorage.removeItem(OFFLINE_CURRENT_USER_KEY)
  localStorage.removeItem("supabase.auth.token")
}

// Alias pour la compatibilité avec d'autres parties du code
export const isOfflineMode = isOfflineModeEnabled

// Fonction pour vérifier la connectivité
export function checkInternetConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    // Essayer de charger un petit fichier ou utiliser l'API navigator.onLine
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      resolve(false)
      return
    }

    // Essayer de charger une petite image ou ressource pour confirmer la connectivité
    const timeout = setTimeout(() => {
      resolve(false)
    }, 5000)

    fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
      cache: "no-store",
    })
      .then(() => {
        clearTimeout(timeout)
        resolve(true)
      })
      .catch(() => {
        clearTimeout(timeout)
        resolve(false)
      })
  })
}
