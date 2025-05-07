"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  getClientSupabase,
  resetClientSupabase,
  checkEnvironmentVariables,
  testSupabaseConnection,
} from "@/lib/client-supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthDebug() {
  const { user, session, isLoading, isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [supabaseInfo, setSupabaseInfo] = useState<string>("Chargement...")
  const [isClient, setIsClient] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [corsTest, setCorsTest] = useState<string>("Non testé")
  const [activeTab, setActiveTab] = useState("info")
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)

    // Vérifier l'état du réseau
    setNetworkStatus(navigator.onLine ? "online" : "offline")

    // Écouter les changements d'état du réseau
    const handleOnline = () => setNetworkStatus("online")
    const handleOffline = () => setNetworkStatus("offline")
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Vérifier les variables d'environnement
    setEnvStatus(checkEnvironmentVariables())

    // Vérifier l'état du client Supabase
    const checkSupabase = async () => {
      try {
        const supabase = getClientSupabase()
        if (!supabase) {
          setSupabaseInfo("Client Supabase non disponible")
          return
        }
        setSupabaseInfo("Client Supabase initialisé")
      } catch (error: any) {
        setSupabaseInfo(`Exception Supabase: ${error.message || "Erreur inconnue"}`)
      }
    }

    checkSupabase()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const testCors = async () => {
    setCorsTest("Test en cours...")
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        setCorsTest("URL Supabase non définie")
        return
      }

      // Tester une requête simple vers Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setCorsTest("Test CORS réussi")
      } else {
        setCorsTest(`Échec du test CORS: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      setCorsTest(`Erreur CORS: ${error.message || "Erreur inconnue"}`)
    }
  }

  const testConnection = async () => {
    setConnectionTestResult({ status: "loading", message: "Test en cours..." })
    try {
      const result = await testSupabaseConnection()
      setConnectionTestResult(result)
    } catch (error: any) {
      setConnectionTestResult({
        success: false,
        message: `Erreur inattendue: ${error.message || "Erreur inconnue"}`,
      })
    }
  }

  const resetClient = () => {
    resetClientSupabase()
    setSupabaseInfo("Client réinitialisé, rafraîchissement...")
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  if (!isClient) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
      >
        Auth Debug
      </Button>

      {isVisible && (
        <Card className="absolute bottom-10 right-0 w-96 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Débogage d'authentification</CardTitle>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="network">Réseau</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-2">
              <CardContent className="text-xs space-y-2 py-2">
                <p>
                  <strong>État:</strong> {isLoading ? "Chargement..." : "Prêt"}
                </p>
                <p>
                  <strong>Authentifié:</strong> {isAuthenticated ? "Oui" : "Non"}
                </p>
                <p>
                  <strong>Session:</strong> {session ? "Valide" : "Nulle"}
                </p>
                <p>
                  <strong>Utilisateur:</strong> {user ? user.email : "Aucun"}
                </p>
                <p>
                  <strong>Supabase:</strong> {supabaseInfo}
                </p>
                <p>
                  <strong>Env:</strong> {process.env.NODE_ENV}
                </p>
                <p>
                  <strong>URL Supabase:</strong> {envStatus?.url ? "Définie" : "Non définie"}
                </p>
                <p>
                  <strong>Clé Supabase:</strong> {envStatus?.key ? "Définie" : "Non définie"}
                </p>

                <div className="pt-2">
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={testConnection}>
                    Tester la connexion Supabase
                  </Button>

                  {connectionTestResult && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p>
                        <strong>Résultat:</strong>{" "}
                        {connectionTestResult.status === "loading"
                          ? "Test en cours..."
                          : connectionTestResult.success
                            ? "✅ Succès"
                            : "❌ Échec"}
                      </p>
                      <p>
                        <strong>Message:</strong> {connectionTestResult.message}
                      </p>
                      {connectionTestResult.details && (
                        <details>
                          <summary className="cursor-pointer">Détails</summary>
                          <pre className="text-xs mt-1 overflow-auto max-h-20">
                            {JSON.stringify(connectionTestResult.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="network">
              <CardContent className="text-xs space-y-2 py-2">
                <Alert variant={networkStatus === "online" ? "default" : "destructive"}>
                  <AlertDescription>
                    Statut réseau: <strong>{networkStatus === "online" ? "En ligne" : "Hors ligne"}</strong>
                  </AlertDescription>
                </Alert>

                <div className="pt-2">
                  <p>
                    <strong>Test CORS:</strong> {corsTest}
                  </p>
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={testCors}>
                    Tester CORS
                  </Button>
                </div>

                {corsTest.includes("Erreur") && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      Problème de CORS détecté. Cela peut empêcher les appels à l'API Supabase.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="actions">
              <CardContent className="text-xs space-y-2 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    console.log("Session:", session)
                    console.log("User:", user)
                    console.log("Env:", process.env)
                    alert("Informations de débogage envoyées à la console")
                  }}
                >
                  Log dans la console
                </Button>

                <Button size="sm" variant="outline" className="w-full text-xs" onClick={resetClient}>
                  Réinitialiser le client Supabase
                </Button>

                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => window.location.reload()}>
                  Rafraîchir la page
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full text-xs"
                  onClick={() => {
                    localStorage.clear()
                    sessionStorage.clear()
                    alert("Cache local effacé. La page va être rechargée.")
                    window.location.reload()
                  }}
                >
                  Effacer le cache local
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="text-xs text-muted-foreground">
            {networkStatus === "offline"
              ? "Vous êtes hors ligne. Vérifiez votre connexion internet."
              : `Dernière vérification: ${new Date().toLocaleTimeString()}`}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
