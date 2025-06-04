import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",, // Assurez-vous qu'il n'y a qu'une seule virgule ici
  // ou pas de virgule du tout si 'description' est la dernière propriété.
  // Par exemple, si vous ajoutez d'autres propriétés:
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
