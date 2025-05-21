"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { testSupabaseConnection, resetClientSupabase } from "@/lib/client-supabase"
import { useAuth } from "@/contexts/auth-context"

export function DiagnosticPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("auth")
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [envVariables, setEnvVariables] = useState<Record<string, string | undefined>>({})
  const { user, session, isLoading, isInitialized, isAuthenticated, refreshSession } = useAuth()

  // Récupérer les variables d'environnement
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEnvVariables({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + "...",
        NODE_ENV: process.env.NODE_ENV,
      })
    }
  }, [])

  // Fonction pour tester la connexion à Supabase
  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Fonction pour réinitialiser le client Supabase
  const handleResetClient = () => {
    resetClientSupabase()
    setConnectionStatus(null)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  // Fonction pour rafraîchir la session
  const handleRefreshSession = async () => {
    try {
      await refreshSession()
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
        >
          Diagnostic
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Diagnostic Panel</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ✕
          </Button>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="connection">Connexion</TabsTrigger>
            <TabsTrigger value="env">Env</TabsTrigger>
          </TabsList>

          <TabsContent value="auth" className="p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <p>
                <strong>Chargement:</strong> {isLoading ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Initialisé:</strong> {isInitialized ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Authentifié:</strong> {isAuthenticated ? "Oui" : "Non"}
              </p>
              <p>
                <strong>User ID:</strong> {user?.id || "Non connecté"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "N/A"}
              </p>
              <p>
                <strong>Session:</strong> {session ? "Valide" : "Nulle"}
              </p>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={handleRefreshSession}>
                Rafraîchir la session
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="connection" className="p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <p>
                <strong>État:</strong>{" "}
                {connectionStatus ? (connectionStatus.success ? "Connecté" : "Déconnecté") : "Non testé"}
              </p>
              {connectionStatus && (
                <p>
                  <strong>Message:</strong> {connectionStatus.message}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button size="sm" onClick={handleTestConnection} disabled={isTestingConnection}>
                {isTestingConnection ? "Test en cours..." : "Tester la connexion"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetClient}>
                Réinitialiser le client
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="env" className="p-4 space-y-4">
            <div className="space-y-2 text-sm">
              {Object.entries(envVariables).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value || "Non défini"}
                </p>
              ))}
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => window.location.reload()}>
                Rafraîchir la page
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <CardContent className="pt-0 pb-2">
          <p className="text-xs text-muted-foreground">Version: {new Date().toISOString().split("T")[0]}</p>
        </CardContent>
      </Card>
    </div>
  )
}
