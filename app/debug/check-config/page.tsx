"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function CheckConfigPage() {
  const [loading, setLoading] = useState(true)
  const [configStatus, setConfigStatus] = useState<{
    supabaseUrl: boolean
    supabaseAnonKey: boolean
    supabaseServiceKey: boolean
    nextAuthSecret: boolean
    nextAuthUrl: boolean
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    supabaseServiceKey: false,
    nextAuthSecret: false,
    nextAuthUrl: false,
  })

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/check-config")
      const data = await response.json()
      setConfigStatus(data)
    } catch (error) {
      console.error("Erreur lors de la vérification de la configuration:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">Vérification de la configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
              <p className="text-gray-300">Vérification de la configuration...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">NEXT_PUBLIC_SUPABASE_URL</span>
                  {configStatus.supabaseUrl ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {configStatus.supabaseAnonKey ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">SUPABASE_SERVICE_ROLE_KEY</span>
                  {configStatus.supabaseServiceKey ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">NEXTAUTH_SECRET</span>
                  {configStatus.nextAuthSecret ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">NEXTAUTH_URL</span>
                  {configStatus.nextAuthUrl ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              {!Object.values(configStatus).every(Boolean) && (
                <div className="bg-amber-900/30 border border-amber-700 rounded p-4 mt-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5 shrink-0" />
                    <div className="text-amber-300 text-sm">
                      <p className="font-semibold mb-1">Configuration incomplète</p>
                      <p>
                        Certaines variables d'environnement sont manquantes. Veuillez les configurer pour que
                        l'application fonctionne correctement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={checkConfig} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                Vérifier à nouveau
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
