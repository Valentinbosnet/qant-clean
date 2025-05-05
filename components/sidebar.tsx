"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, LineChart, Wallet, History, Settings, HelpCircle } from "lucide-react"
import { useEffect, useState } from "react"
import SidebarLoading from "./sidebar-loading"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier directement dans la base de données si l'email est vérifié
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/check-status")
          const data = await response.json()
          console.log("Sidebar - Database status:", data)
          setIsEmailVerified(data.emailVerified)
        } catch (error) {
          console.error("Sidebar - Error checking status:", error)
          // En cas d'erreur, utiliser la valeur de la session
          setIsEmailVerified(!!session?.user?.emailVerified)
        } finally {
          setIsLoading(false)
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false)
      }
    }

    checkEmailVerification()
  }, [status, session])

  // If user is not logged in, don't show sidebar
  if (status !== "authenticated" || !session) {
    return null
  }

  // Afficher le composant de chargement pendant la vérification
  if (isLoading) {
    return <SidebarLoading className={className} />
  }

  // Si l'email n'est pas vérifié, afficher la barre latérale limitée
  if (isEmailVerified === false) {
    return (
      <div className={cn("flex h-full w-60 flex-col bg-gray-800 text-white", className)}>
        <div className="flex flex-col space-y-6 p-4">
          <div className="py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Required Steps</h2>
            <div className="space-y-1">
              <Link
                href="/verify-email"
                className={cn(
                  "flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/verify-email"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Email Verification
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full sidebar for users who have completed email verification
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Portfolio",
      icon: Wallet,
      href: "/portfolio",
      active: pathname === "/portfolio",
    },
    {
      label: "Predictions",
      icon: LineChart,
      href: "/predictions",
      active: pathname === "/predictions",
    },
    {
      label: "Transactions",
      icon: History,
      href: "/transactions",
      active: pathname === "/transactions",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
      active: pathname === "/help",
    },
  ]

  return (
    <div className={cn("flex h-full w-60 flex-col bg-gray-800 text-white", className)}>
      <div className="flex flex-col space-y-6 p-4">
        <div className="py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  route.active ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
              >
                <route.icon className="mr-3 h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
