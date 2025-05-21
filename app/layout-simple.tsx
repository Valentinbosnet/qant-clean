import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import { AuthStatusSimple } from "@/components/auth-status-simple"
import { BellPlus } from "lucide-react"

export const metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",
}

export default function SimpleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
                <AuthStatusSimple />
              </nav>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
