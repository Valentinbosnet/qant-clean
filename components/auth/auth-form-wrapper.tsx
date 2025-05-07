"use client"

import { useSearchParams } from "next/navigation"
import { AuthForm } from "./auth-form"

export function AuthFormWrapper() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") === "signup" ? "signup" : "signin"

  return <AuthForm defaultTab={tab} />
}
