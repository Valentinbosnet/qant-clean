import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",, // C'est la ligne corrigée.
  // Si vous ajoutez d'autres propriétés ci-dessous, cette virgule est correcte.
  // Si 'description' est la dernière propriété, cette virgule est facultative mais non erronée.
  // Exemple avec d'autres propriétés :
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
