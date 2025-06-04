import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",, // LIGNE CORRIGÉE
  // Vous pouvez ajouter d'autres propriétés ici si nécessaire, par exemple:
  // generator: "v0.dev",
  // icons: { icon: "/favicon.ico" },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
