"use client"
import type { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  return <>{children}</>
}

export default AuthGuard
