"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredPlan: "premium" | "pro"
}

export default function SubscriptionGuard({ children, requiredPlan }: SubscriptionGuardProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") return

      if (!session?.user) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch(`/api/user/check-subscription?plan=${requiredPlan}`)
        const data = await response.json()

        if (response.ok && data.hasAccess) {
          setHasAccess(true)
        } else {
          router.push("/pricing")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'abonnement:", error)
        router.push("/pricing")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [session, status, router, requiredPlan])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Vérification de votre abonnement...</span>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : null
}
