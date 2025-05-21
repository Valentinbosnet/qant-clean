import type React from "react"
import Head from "next/head"
import "./globals.css"
import type { Metadata } from "next"
import { LayoutClient } from "./layout-client"

export const metadata: Metadata = {
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
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
