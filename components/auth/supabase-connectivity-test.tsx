"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, WifiOff, ExternalLink } from "lucide-react"
import { checkSupabaseConnectivity } from "@/lib/supabase-proxy"
import Link from "next/link"

export function SupabaseConnectivityTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    direct: boolean
    proxy: boolean
    error?: string
    details?: any
  } | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const runTests = async () => {
    if (!isClient) return

    setIsLoading(true)
    try {
      const results = await checkSupabaseConnectivity()
      setTestResults(results)
    } catch (error: any) {
      setTestResults({
        direct: false,
        proxy: false,
        error: `Erreur inattendue: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Exécuter les tests automatiquement au chargement
  useEffect(() => {
    if (isClient) {
      runTests()
    }
  }, [isClient])

  if (!isClient) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <WifiOff className="h-5 w-5" />
          Test de connectivité Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Test de connectivité en cours...</p>
          </div>
        ) : testResults ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {testResults.direct ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <h3 className="font-medium">Connexion directe</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {testResults.direct
                    ? "La connexion directe à Supabase fonctionne correctement."
                    : "La connexion directe à Supabase a échoué."}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {testResults.proxy ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <h3 className="font-medium">Connexion via proxy</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {testResults.proxy
                    ? "La connexion via proxy fonctionne correctement."
                    : "La connexion via proxy a échoué."}
                </p>
              </div>
            </div>

            {testResults.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur détectée</AlertTitle>
                <AlertDescription>{testResults.error}</AlertDescription>
              </Alert>
            )}

            {!testResults.direct && !testResults.proxy ? (
              <Alert variant="destructive">
                <AlertTitle>Problème de connectivité critique</AlertTitle>
                <AlertDescription>
                  Aucune méthode de connexion à Supabase ne fonctionne. Consultez le guide de configuration pour
                  résoudre ce problème.
                </AlertDescription>
              </Alert>
            ) : !testResults.direct && testResults.proxy ? (
              <Alert variant="warning">
                <AlertTitle>Connexion limitée</AlertTitle>
                <AlertDescription>
                  La connexion directe échoue mais le proxy fonctionne. Cela indique probablement un problème de
                  configuration CORS.
                </AlertDescription>
              </Alert>
            ) : testResults.direct ? (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Connexion établie</AlertTitle>
                <AlertDescription>La connexion à Supabase fonctionne correctement.</AlertDescription>
              </Alert>
            ) : null}

            <div className="bg-muted p-3 rounded-md">
              <h3 className="font-medium mb-2">Solutions possibles:</h3>
              <ul className="text-sm space-y-1">
                <li>• Vérifiez votre connexion internet</li>
                <li>• Configurez correctement les paramètres CORS dans Supabase</li>
                <li>• Vérifiez que vos variables d'environnement sont correctement définies</li>
                <li>• Désactivez les extensions de navigateur qui pourraient bloquer les requêtes</li>
                <li>• Essayez un autre navigateur</li>
              </ul>
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="w-full mt-2">
              {showDetails ? "Masquer les détails techniques" : "Afficher les détails techniques"}
            </Button>

            {showDetails && testResults.details && (
              <div className="bg-black text-white p-3 rounded-md overflow-auto max-h-60 text-xs">
                <pre>{JSON.stringify(testResults.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={runTests} disabled={isLoading} variant="outline" className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Test en cours...
            </>
          ) : (
            "Relancer les tests"
          )}
        </Button>

        <Link href="/auth/setup" className="w-full">
          <Button variant="default" className="w-full flex items-center gap-2">
            Consulter le guide de configuration <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
