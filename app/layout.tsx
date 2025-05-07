import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { UserMenu } from "@/components/user-menu"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between py-4">
                <Link href="/" className="font-bold text-xl">
                  Stock Dashboard
                </Link>
                <nav className="flex items-center gap-6">
                  <Link href="/search" className="text-sm font-medium">
                    Search
                  </Link>
                  <Link href="/favorites" className="text-sm font-medium">
                    Favorites
                  </Link>
                  <UserMenu />
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
