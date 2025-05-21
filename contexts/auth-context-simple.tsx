"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

// Contexte d'authentification simplifié
const AuthContext = createContext({
  user: { id: "user-1", name: "Utilisateur Test" },
  isAuthenticated: true,
  signIn: () => {},
  signOut: () => {},
})

export function AuthProviderSimple({ children }: { children: React.ReactNode }) {
  const [user] = useState({ id: "user-1", name: "Utilisateur Test" })

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        signIn: () => console.log("Sign in"),
        signOut: () => console.log("Sign out"),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthSimple = () => useContext(AuthContext)
