import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",, // Correction: UNE SEULE virgule ici ou pas de virgule si c'est le dernier élément
  // Si vous ajoutez d'autres clés après 'description', alors une virgule est nécessaire.
  // Par exemple:
  // description: "Track the performance of popular stocks",
  // generator: "v0.dev", // Exemple d'une autre clé
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
