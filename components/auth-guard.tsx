"use client"

import type React from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
