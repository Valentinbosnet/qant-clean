"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()

  // Handle redirects for known missing pages
  useEffect(() => {
    if (pathname === "/verify-email-notice") {
      router.push("/verify-email")
    }
  }, [pathname, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-300">Sorry, the page you're looking for doesn't exist or has been moved.</p>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Go to Dashboard
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
