import type React from "react"
import type { Metadata } from "next"
import "./globals.css" // Assurez-vous que ce fichier existe
import { ClientProviders } from "./client-providers" // Chemin vers votre composant de providers

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Track the performance of popular stocks",,
  // Vous pouvez ajouter d'autres métadonnées ici, comme les icônes
  // icons: {
  //   icon: '/favicon.ico',
  //   apple: '/apple-touch-icon.png',
  // },
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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
