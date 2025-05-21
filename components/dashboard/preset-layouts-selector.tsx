"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getPresetLayouts, applyPresetLayout, type PresetLayout } from "@/lib/preset-layouts-service"
import type { DashboardLayout } from "@/lib/dashboard-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutTemplate, Info, Check, Loader2 } from "lucide-react"
import Image from "next/image"

interface PresetLayoutsSelectorProps {
  dashboardConfig: DashboardLayout
  setDashboardConfig: (config: DashboardLayout) => void
  onApply?: () => void
}

export function PresetLayoutsSelector({ dashboardConfig, setDashboardConfig, onApply }: PresetLayoutsSelectorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [presetLayouts, setPresetLayouts] = useState<PresetLayout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetLayout | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // Charger les layouts prédéfinis
  useEffect(() => {
    async function loadPresetLayouts() {
      setIsLoading(true)
      try {
        const layouts = await getPresetLayouts(user)
        setPresetLayouts(layouts)
      } catch (error) {
        console.error("Erreur lors du chargement des layouts prédéfinis:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les layouts prédéfinis",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPresetLayouts()
  }, [user, toast])

  // Filtrer les layouts par catégorie
  const filteredLayouts =
    activeTab === "all" ? presetLayouts : presetLayouts.filter((layout) => layout.category === activeTab)

  // Appliquer un layout prédéfini
  const handleApplyPreset = async () => {
    if (!selectedPreset) return

    setIsApplying(true)
    try {
      // Appliquer le layout prédéfini
      const newWidgets = applyPresetLayout(selectedPreset)

      // Mettre à jour le tableau de bord
      setDashboardConfig({
        ...dashboardConfig,
        widgets: newWidgets,
        lastUpdated: new Date().toISOString(),
      })

      toast({
        title: "Layout appliqué",
        description: `Le layout "${selectedPreset.name}" a été appliqué avec succès`,
      })

      // Fermer les dialogues
      setIsConfirmDialogOpen(false)
      setIsDialogOpen(false)

      // Appeler le callback si fourni
      if (onApply) onApply()
    } catch (error) {
      console.error("Erreur lors de l'application du layout prédéfini:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le layout prédéfini",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  // Prévisualiser un layout
  const handlePreviewPreset = (preset: PresetLayout) => {
    setSelectedPreset(preset)
    setIsConfirmDialogOpen(true)
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Layouts prédéfinis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Layouts prédéfinis</DialogTitle>
            <DialogDescription>
              Choisissez un layout prédéfini pour l'appliquer à votre tableau de bord
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="analytics">Analytique</TabsTrigger>
              <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
              <TabsTrigger value="custom">Personnalisé</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              <TabsContent value={activeTab} className="mt-0 h-[500px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredLayouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Aucun layout trouvé</h3>
                    <p className="text-muted-foreground mt-2">
                      Aucun layout prédéfini n'est disponible dans cette catégorie
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLayouts.map((preset) => (
                      <Card key={preset.id} className="overflow-hidden">
                        <div className="relative h-36 bg-muted">
                          <Image
                            src={preset.thumbnail || "/placeholder.svg"}
                            alt={preset.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">{preset.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{preset.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-sm text-muted-foreground">
                            <p>Widgets: {preset.widgets.length}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button onClick={() => handlePreviewPreset(preset)} className="w-full">
                            Appliquer
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'application du layout</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'appliquer le layout "{selectedPreset?.name}". Cette action remplacera tous vos
              widgets actuels.
            </DialogDescription>
          </DialogHeader>

          {selectedPreset && (
            <div className="relative h-48 bg-muted rounded-md overflow-hidden my-4">
              <Image
                src={selectedPreset.thumbnail || "/placeholder.svg"}
                alt={selectedPreset.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-start space-x-2">
            <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Cette action ne peut pas être annulée. Assurez-vous de sauvegarder votre layout actuel si vous souhaitez
              le conserver.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApplyPreset} disabled={isApplying} className="gap-2">
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Application...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Appliquer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
