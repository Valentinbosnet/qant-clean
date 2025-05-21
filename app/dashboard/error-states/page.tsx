"use client"

import { useState } from "react"
import { TemplatePreview } from "@/components/dashboard/template-preview"
import { dashboardTemplates } from "@/lib/dashboard-templates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorStateInfo } from "@/components/dashboard/error-state-info"
import type { ErrorStateType } from "@/components/dashboard/error-state-controls"

export default function ErrorStatesPage() {
  const [activeErrorState, setActiveErrorState] = useState<ErrorStateType>("none")

  // Utiliser le premier template comme exemple
  const template = dashboardTemplates[0]

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">États d'erreur du tableau de bord</h1>
        <p className="text-muted-foreground mb-8">
          Cette page démontre comment le tableau de bord gère différents états d'erreur pour garantir une expérience
          utilisateur robuste.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Guide des états d'erreur</CardTitle>
            <CardDescription>
              Sélectionnez un état d'erreur pour voir comment le tableau de bord le gère.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="no-data" onValueChange={(v) => setActiveErrorState(v as ErrorStateType)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="no-data">Absence de données</TabsTrigger>
                <TabsTrigger value="loading-error">Erreur de chargement</TabsTrigger>
                <TabsTrigger value="network-offline">Déconnexion réseau</TabsTrigger>
              </TabsList>
              <TabsContent value="no-data">
                <ErrorStateInfo type="no-data" />
              </TabsContent>
              <TabsContent value="loading-error">
                <ErrorStateInfo type="loading-error" />
              </TabsContent>
              <TabsContent value="network-offline">
                <ErrorStateInfo type="network-offline" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Prévisualisation</h2>
          <p className="text-muted-foreground mb-4">
            Voici comment le tableau de bord apparaît avec l'état d'erreur sélectionné.
          </p>
        </div>

        <TemplatePreview template={template} onErrorStateChange={setActiveErrorState} />
      </div>
    </div>
  )
}
