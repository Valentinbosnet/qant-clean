"use client"

import type React from "react"
import Link from "next/link"
import { AuthStatus } from "@/components/auth-status"
import { BellPlus, Settings } from "lucide-react"
import { OfflineIndicator } from "@/components/offline-indicator"

export function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="font-bold text-xl">
            Stock Dashboard
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/search" className="text-sm font-medium">
              Recherche
            </Link>
            <Link href="/favorites" className="text-sm font-medium">
              Favoris
            </Link>
            <Link
              href="/prediction-alerts"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
            >
              <BellPlus className="h-4 w-4 mr-2" />
              Alertes de prédiction
            </Link>
            <Link
              href="/settings/offline"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
            <OfflineIndicator />
            <AuthStatus />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  )
}
