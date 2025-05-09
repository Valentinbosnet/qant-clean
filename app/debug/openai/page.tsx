import { OpenAIKeyDiagnostic } from "@/components/api/openai-key-diagnostic"
import { SimpleApiStatus } from "@/components/api/simple-api-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OpenAIDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Diagnostic OpenAI</h1>

      <Tabs defaultValue="key">
        <TabsList className="mb-4">
          <TabsTrigger value="key">Clé API</TabsTrigger>
          <TabsTrigger value="test">Test de prédiction</TabsTrigger>
        </TabsList>

        <TabsContent value="key">
          <div className="grid gap-6">
            <OpenAIKeyDiagnostic />

            <Card>
              <CardHeader>
                <CardTitle>Instructions de configuration</CardTitle>
                <CardDescription>Comment configurer correctement la clé API OpenAI</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. Obtenir une clé API OpenAI</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rendez-vous sur{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        platform.openai.com/api-keys
                      </a>{" "}
                      pour créer une clé API.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium">2. Configurer la clé API dans l'application</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allez dans{" "}
                      <a href="/settings/api" className="text-primary underline">
                        Paramètres &gt; API
                      </a>{" "}
                      et ajoutez votre clé API OpenAI.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium">3. Vérifier la configuration</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilisez l'outil de diagnostic ci-dessus pour vérifier que la clé API est correctement configurée.
                    </p>
                  </div>

                  <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                    <p className="font-medium">Note importante</p>
                    <p>
                      La clé API OpenAI est stockée de manière sécurisée et n'est utilisée que côté serveur. Elle n'est
                      jamais exposée au client.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <SimpleApiStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
