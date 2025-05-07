"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, CheckCircle, Settings, Globe, Shield } from "lucide-react"
import { checkSupabaseConnectivity } from "@/lib/supabase-proxy"
import { checkEnvironmentVariables } from "@/lib/client-supabase"

export function SupabaseSetupGuide() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    direct: boolean
    proxy: boolean
    error?: string
  } | null>(null)
  const [envStatus, setEnvStatus] = useState<{
    url: boolean
    key: boolean
    env: string | undefined
  } | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    try {
      // Vérifier les variables d'environnement
      const envVars = checkEnvironmentVariables()
      setEnvStatus(envVars)

      // Tester la connectivité
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Guide de configuration Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostic">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="cors">Configuration CORS</TabsTrigger>
            <TabsTrigger value="env">Variables d'environnement</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Diagnostic de connectivité Supabase</AlertTitle>
                <AlertDescription>
                  Cet outil vérifie la connectivité avec Supabase et identifie les problèmes potentiels.
                </AlertDescription>
              </Alert>

              <Button onClick={runTests} disabled={isLoading} variant="default" className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Test en cours...
                  </>
                ) : (
                  "Lancer le diagnostic"
                )}
              </Button>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Test de connectivité en cours...</p>
                </div>
              ) : testResults ? (
                <div className="space-y-4 mt-4">
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

                  {envStatus && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Variables d'environnement</h3>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          {envStatus.url ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          NEXT_PUBLIC_SUPABASE_URL: {envStatus.url ? "Définie" : "Non définie"}
                        </li>
                        <li className="flex items-center gap-2">
                          {envStatus.key ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.key ? "Définie" : "Non définie"}
                        </li>
                        <li>Environnement: {envStatus.env || "Non défini"}</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="cors">
            <div className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertTitle>Configuration CORS dans Supabase</AlertTitle>
                <AlertDescription>
                  Les problèmes CORS sont une cause fréquente d'erreurs de connectivité avec Supabase.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-medium">Comment configurer CORS dans Supabase :</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Connectez-vous à votre tableau de bord Supabase</li>
                  <li>Sélectionnez votre projet</li>
                  <li>
                    Allez dans <strong>Authentication &gt; URL Configuration</strong>
                  </li>
                  <li>
                    Dans la section <strong>Site URL</strong>, ajoutez l'URL de votre application (par exemple,
                    https://votre-app.vercel.app)
                  </li>
                  <li>
                    Dans la section <strong>Redirect URLs</strong>, ajoutez les URLs de redirection suivantes :
                    <ul className="list-disc pl-5 mt-1">
                      <li>https://votre-app.vercel.app/auth/callback</li>
                      <li>http://localhost:3000/auth/callback (pour le développement local)</li>
                    </ul>
                  </li>
                  <li>
                    Allez dans <strong>API &gt; Settings</strong>
                  </li>
                  <li>
                    Dans la section <strong>API Settings</strong>, ajoutez les origines autorisées :
                    <ul className="list-disc pl-5 mt-1">
                      <li>https://votre-app.vercel.app</li>
                      <li>http://localhost:3000 (pour le développement local)</li>
                    </ul>
                  </li>
                  <li>Cliquez sur "Save" pour enregistrer les modifications</li>
                </ol>

                <div className="bg-muted p-4 rounded-md mt-4">
                  <h4 className="font-medium mb-2">Exemple de configuration CORS</h4>
                  <pre className="text-xs overflow-auto p-2 bg-black text-white rounded">
                    {`// Dans API > Settings > API Settings
ALLOWED ORIGINS:
https://votre-app.vercel.app
http://localhost:3000

// Dans Authentication > URL Configuration
SITE URL:
https://votre-app.vercel.app

REDIRECT URLS:
https://votre-app.vercel.app/auth/callback
http://localhost:3000/auth/callback`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="env">
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Configuration des variables d'environnement</AlertTitle>
                <AlertDescription>
                  Assurez-vous que vos variables d'environnement sont correctement configurées.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-medium">Variables d'environnement requises :</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {`NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-supabase`}
                  </pre>
                </div>

                <h3 className="font-medium mt-4">Comment configurer les variables d'environnement :</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Sur Vercel :</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Allez dans les paramètres de votre projet sur Vercel</li>
                      <li>Cliquez sur "Environment Variables"</li>
                      <li>Ajoutez les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      <li>Redéployez votre application</li>
                    </ul>
                  </li>
                  <li>
                    <strong>En développement local :</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Créez un fichier .env.local à la racine de votre projet</li>
                      <li>Ajoutez les variables d'environnement dans ce fichier</li>
                      <li>Redémarrez votre serveur de développement</li>
                    </ul>
                  </li>
                </ol>

                <h3 className="font-medium mt-4">Où trouver vos clés Supabase :</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Connectez-vous à votre tableau de bord Supabase</li>
                  <li>Sélectionnez votre projet</li>
                  <li>
                    Allez dans <strong>Project Settings &gt; API</strong>
                  </li>
                  <li>
                    Vous trouverez votre URL et votre clé anon/public dans la section <strong>Project URL</strong> et{" "}
                    <strong>Project API keys</strong>
                  </li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Si vous continuez à rencontrer des problèmes après avoir suivi ces étapes, vérifiez les journaux de la console
          du navigateur pour plus de détails.
        </div>
      </CardFooter>
    </Card>
  )
}
