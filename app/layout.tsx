import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers" // Importation du composant Providers
import "./globals.css" // Assurez-vous que ce fichier existe et contient vos styles globaux

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",, // Virgule en trop supprimée
  // Vous pouvez ajouter d'autres métadonnées ici si nécessaire
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
