import type React from "react"
import Head from "next/head"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import Link from "next/link"
import { AuthStatus } from "@/components/auth-status"
import { BellPlus } from "lucide-react"

export const metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
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
                  <AuthStatus />
                </nav>
              </div>
            </header>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
