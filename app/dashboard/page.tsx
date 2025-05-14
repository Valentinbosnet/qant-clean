"use client"

import { useState } from "react"
import { ConfigurableDashboard } from "@/components/dashboard/configurable-dashboard"
import { WidgetMenu } from "@/components/dashboard/widget-menu"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { WidgetSettings } from "@/components/dashboard/widget-settings"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { layout, isLoading, handleAddWidget, handleRemoveWidget, handleUpdateWidget, handleLayoutChange } =
    useDashboard()

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <div className="space-x-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Tableau de bord personnalisé</CardTitle>
            <CardDescription>Connectez-vous pour accéder à votre tableau de bord personnalisé</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Le tableau de bord personnalisé vous permet de configurer votre espace de travail selon vos besoins en
              ajoutant, supprimant et réorganisant des widgets.
            </p>
            <Button variant="default" asChild>
              <a href="/auth">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vérifier si layout existe avant d'accéder à ses propriétés
  if (!layout) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Erreur de chargement</CardTitle>
            <CardDescription>Impossible de charger votre tableau de bord</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Une erreur s'est produite lors du chargement de votre tableau de bord. Veuillez rafraîchir la page ou
              contacter le support si le problème persiste.
            </p>
            <Button variant="default" onClick={() => window.location.reload()}>
              Rafraîchir la page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddWidgetClick = (type: string, title: string, settings: any = {}) => {
    handleAddWidget(type, title, settings)
    setAddMenuOpen(false)
    toast({
      title: "Widget ajouté",
      description: `Le widget "${title}" a été ajouté à votre tableau de bord`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={() => setAddMenuOpen(true)} aria-label="Ajouter un widget">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Paramètres du tableau de bord"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfigurableDashboard />

      <WidgetMenu open={addMenuOpen} onClose={() => setAddMenuOpen(false)} onAddWidget={handleAddWidgetClick} />

      <WidgetSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
