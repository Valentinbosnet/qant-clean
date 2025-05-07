"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiStatus() {
  const [status, setStatus] = useState<"ok" | "rate-limited" | "error">("ok")
  const [message, setMessage] = useState<string>("")

  // Listen for API rate limit events
  useEffect(() => {
    const handleRateLimit = (event: CustomEvent) => {
      setStatus("rate-limited")
      setMessage("Alpha Vantage API rate limit reached (25 requests per day). Using fallback data.")
    }

    const handleApiError = (event: CustomEvent) => {
      setStatus("error")
      setMessage(event.detail?.message || "Error connecting to the stock API. Using fallback data.")
    }

    window.addEventListener("api-rate-limit", handleRateLimit as EventListener)
    window.addEventListener("api-error", handleApiError as EventListener)

    return () => {
      window.removeEventListener("api-rate-limit", handleRateLimit as EventListener)
      window.removeEventListener("api-error", handleApiError as EventListener)
    }
  }, [])

  if (status === "ok") return null

  return (
    <Alert variant={status === "rate-limited" ? "destructive" : "warning"} className="mb-6">
      {status === "rate-limited" ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      <AlertTitle>{status === "rate-limited" ? "API Rate Limit Reached" : "API Warning"}</AlertTitle>
      <AlertDescription>
        {message}
        {status === "rate-limited" && (
          <div className="mt-2">
            <a
              href="https://www.alphavantage.co/premium/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Subscribe to a premium plan
            </a>{" "}
            to remove this limitation.
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
