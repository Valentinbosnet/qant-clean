"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Key, RefreshCw, Save, Copy } from "lucide-react"

export function AdvancedApiDiagnostics() {
  const [apiKeyDebug, setApiKeyDebug] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newApiKey, setNewApiKey] = useState("")
  const [updateStatus, setUpdateStatus] = useState<{ message: string; success: boolean } | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)

  const checkApiKey = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug/api-key-check")
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }
      const data = await response.json()
      setApiKeyDebug(data)
    } catch (error) {
      console.error("Erreur lors de la vérification de la clé API:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApiKey = async () => {
    if (!newApiKey.trim()) {
      setUpdateStatus({
        message: "La clé API ne peut pas être vide",
        success: false,
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/settings/update-api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openai: newApiKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()

      setUpdateStatus({
        message: "Clé API mise à jour avec succès",
        success: true,
      })

      // Vérifier à nouveau l'état de la clé API
      await checkApiKey()
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la clé API:", error)
      setUpdateStatus({
        message: `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testApiKey = async () => {
    setIsTestLoading(true)
    try {
      const response = await fetch("/api/test/openai-simple")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error("Erreur lors du test de la clé API:", error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsTestLoading(false)
    }
  }

  useEffect(() => {
    checkApiKey()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnostic avancé de l'API OpenAI</CardTitle>
        <CardDescription>Vérifiez et corrigez les problèmes de configuration de l'API OpenAI</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status">Statut</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            {apiKeyDebug ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">État de la clé API</h3>
                  <Badge variant={apiKeyDebug.debug.keyExists ? "success" : "destructive"}>
                    {apiKeyDebug.debug.keyExists ? "Configurée" : "Non configurée"}
                  </Badge>
                </div>

                <div className="grid gap-4 border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Présence:</div>
                    <div className="flex items-center">
                      {apiKeyDebug.debug.keyExists ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Trouvée</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span>Non trouvée</span>
                        </>
                      )}
                    </div>

                    {apiKeyDebug.debug.keyExists && (
                      <>
                        <div className="font-medium">Longueur:</div>
                        <div>{apiKeyDebug.debug.keyLength} caractères</div>

                        <div className="font-medium">Format:</div>
                        <div className="flex items-center">
                          {apiKeyDebug.debug.keyFormat === "valid" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              <span>Valide (commence par sk-)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>Potentiellement invalide</span>
                            </>
                          )}
                        </div>

                        <div className="font-medium">Premiers caractères:</div>
                        <div>{apiKeyDebug.debug.keyFirstChars}...</div>

                        <div className="font-medium">Derniers caractères:</div>
                        <div>...{apiKeyDebug.debug.keyLastChars}</div>
                      </>
                    )}

                    <div className="font-medium">Environnement:</div>
                    <div>{apiKeyDebug.debug.envVariables.NODE_ENV}</div>

                    <div className="font-medium">Vercel ENV:</div>
                    <div>{apiKeyDebug.debug.envVariables.VERCEL_ENV || "N/A"}</div>
                  </div>
                </div>

                {!apiKeyDebug.debug.keyExists && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Clé API manquante</AlertTitle>
                    <AlertDescription>
                      La clé API OpenAI n'est pas configurée. Veuillez l'ajouter dans l'onglet "Configuration".
                    </AlertDescription>
                  </Alert>
                )}

                {apiKeyDebug.debug.keyExists && apiKeyDebug.debug.keyFormat === "invalid" && (
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Format de clé potentiellement invalide</AlertTitle>
                    <AlertDescription>
                      La clé API ne commence pas par "sk-", ce qui est le format standard pour les clés API OpenAI.
                      Vérifiez que vous avez copié la clé correctement.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={checkApiKey} variant="outline" disabled={isLoading} className="w-full">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Actualiser le statut
                </Button>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40">
                <RefreshCw className={`h-8 w-8 text-primary animate-spin`} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="config">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API OpenAI</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <Button onClick={() => navigator.clipboard.readText().then((text) => setNewApiKey(text))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  La clé API doit commencer par "sk-" et comprend généralement environ 50 caractères.
                </p>
              </div>

              {updateStatus && (
                <Alert variant={updateStatus.success ? "default" : "destructive"}>
                  {updateStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{updateStatus.success ? "Succès" : "Erreur"}</AlertTitle>
                  <AlertDescription>{updateStatus.message}</AlertDescription>
                </Alert>
              )}

              <Button onClick={updateApiKey} disabled={isLoading || !newApiKey.trim()} className="w-full">
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Mettre à jour la clé API
              </Button>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Conseils de dépannage:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Assurez-vous de copier la clé API complète sans espaces supplémentaires</li>
                  <li>• Vérifiez que la clé API est active dans votre compte OpenAI</li>
                  <li>• Essayez de générer une nouvelle clé API si nécessaire</li>
                  <li>• Les clés API commencent généralement par "sk-"</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Testez votre clé API OpenAI pour vérifier qu'elle fonctionne correctement. Ce test envoie une requête
                simple à l'API OpenAI.
              </p>

              <Button onClick={testApiKey} disabled={isTestLoading} className="w-full">
                {isTestLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                Tester la clé API
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{testResult.success ? "Test réussi" : "Échec du test"}</AlertTitle>
                  <AlertDescription>
                    {testResult.success ? (
                      <div>
                        <p>La clé API OpenAI fonctionne correctement !</p>
                        {testResult.response && (
                          <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                            <p className="font-medium">Réponse de l'API:</p>
                            <p>{testResult.response}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{testResult.error || "Une erreur s'est produite lors du test de l'API"}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Si le test échoue:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vérifiez que votre clé API est correctement saisie</li>
                  <li>• Assurez-vous que votre compte OpenAI dispose de crédits suffisants</li>
                  <li>• Vérifiez les restrictions régionales potentielles</li>
                  <li>• Essayez de générer une nouvelle clé API</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => (window.location.href = "/settings/api")}>
          Retour aux paramètres
        </Button>

        <Button
          variant="default"
          onClick={() => (window.location.href = "https://platform.openai.com/api-keys")}
          target="_blank"
        >
          <Key className="h-4 w-4 mr-2" />
          Gérer les clés API
        </Button>
      </CardFooter>
    </Card>
  )
}
