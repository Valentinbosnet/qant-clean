"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import { useRouter } from "next/router"
import type { User } from "@/types"
import { getAccessToken, removeAccessToken, setAccessToken } from "@/lib/access-token"
import { getRefreshToken, removeRefreshToken, setRefreshToken } from "@/lib/refresh-token"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { revalidatePath } from "next/cache"
import { useSession } from "next-auth/react"
import { authenticateOfflineUser } from "@/lib/prefetch-service"

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const { toast } = useToast()
  const session = useSession()

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true)
      try {
        const accessToken = getAccessToken()
        const refreshToken = getRefreshToken()

        if (accessToken && refreshToken) {
          const user = await getCurrentUser(accessToken)
          if (user) {
            setUser(user)
            setAccessTokenState(accessToken)
            setRefreshTokenState(refreshToken)
          } else {
            // Access token might be invalid, attempt to refresh or logout
            console.log("Access token invalid, attempting logout")
            await logout() // Clear tokens and user data
          }
        } else {
          // Check for offline mode authentication
          const offlineUser = await authenticateOfflineUser()
          if (offlineUser) {
            setUser(offlineUser)
            // In offline mode, we don't have access/refresh tokens
            setAccessTokenState("offline_access_token")
            setRefreshTokenState("offline_refresh_token")
          }
        }
      } catch (error) {
        console.error("Error loading user from storage:", error)
        // Handle errors appropriately, possibly logout
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  const login = async (accessToken: string, refreshToken: string, user: User) => {
    setUser(user)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setAccessTokenState(accessToken)
    setRefreshTokenState(refreshToken)
    revalidatePath("/")
    toast({
      title: "Login successful!",
      description: `Welcome, ${user.name}!`,
    })
  }

  const logout = async () => {
    setUser(null)
    removeAccessToken()
    removeRefreshToken()
    setAccessTokenState(null)
    setRefreshTokenState(null)
    revalidatePath("/")
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const refreshUser = async () => {
    if (accessToken) {
      try {
        const user = await getCurrentUser(accessToken)
        if (user) {
          setUser(user)
        } else {
          console.error("Failed to refresh user data.")
          // Optionally, handle the case where refreshing user data fails
        }
      } catch (error) {
        console.error("Error refreshing user:", error)
        // Handle errors appropriately
      }
    }
  }

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
