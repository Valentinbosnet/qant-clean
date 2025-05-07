"use client"

import { useSearchParams } from "next/navigation"
import { DirectAuthForm } from "./direct-auth-form"

export function DirectAuthFormWrapper() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") === "signup" ? "signup" : "signin"

  return <DirectAuthForm defaultTab={tab} />
}
