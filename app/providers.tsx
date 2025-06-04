"use client" // Indispensable pour SessionProvider

import type React from "react"
import { SessionProvider } from "next-auth/react"

// Vous pouvez ajouter d'autres providers ici (ThemeProvider, QueryClientProvider, etc.)
// en les imbriquant. Par exemple :
// <SessionProvider>
//   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//     {children}
//   </ThemeProvider>
// </SessionProvider>

export function Providers({ children }: { children: React.ReactNode }) {
  // La prop `session` n'est plus nécessaire à passer manuellement ici
  // avec les versions récentes de next-auth et l'App Router.
  // SessionProvider la récupérera automatiquement.
  return <SessionProvider>{children}</SessionProvider>
}
