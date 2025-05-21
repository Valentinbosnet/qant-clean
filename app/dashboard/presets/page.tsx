"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getPresetLayouts, deletePresetLayout, type PresetLayout } from "@/lib/preset-layouts-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PresetLayoutPreview } from "@/components/dashboard/preset-layout-preview"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2, Loader2, Info, User, Globe } from "lucide-react"
import Link from "next/link"

export default function PresetLayoutsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [presetLayouts, setPresetLayouts] = useState<PresetLayout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  // Filtrer les layouts par propriété
  const myLayouts = presetLayouts.filter((layout) => layout.createdBy === user?.id)
  const publicLayouts = presetLayouts.filter((layout) => layout.isPublic && layout.createdBy !== user?.id)

  // Supprimer un layout prédéfini
  const handleDelete = async (presetId: string) => {
    setDeletingId(presetId)
    try {
      const success = await deletePresetLayout(user, presetId)
      if (success) {
        // Mettre à jour la liste des layouts
        setPresetLayouts(presetLayouts.filter((layout) => layout.id !== presetId))
        toast({
          title: "Layout supprimé",
          description: "Le layout prédéfini a été supprimé avec succès",
        })
      } else {
        throw new Error("Échec de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du layout prédéfini:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le layout prédéfini",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Layouts Prédéfinis</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos layouts prédéfinis et découvrez ceux partagés par la communauté
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          <TabsTrigger value="custom">Personnalisé</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun layout trouvé</h3>
              <p className="text-muted-foreground mt-2">Aucun layout prédéfini n'est disponible dans cette catégorie</p>
            </div>
          ) : (
            <>
              {user && myLayouts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Mes layouts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myLayouts
                      .filter((layout) => activeTab === "all" || layout.category === activeTab)
                      .map((preset) => (
                        <Card key={preset.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle>{preset.name}</CardTitle>
                              {preset.isPublic && <Globe className="h-4 w-4 text-muted-foreground" title="Public" />}
                            </div>
                            <CardDescription>{preset.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <PresetLayoutPreview preset={preset} isInteractive />
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>Widgets: {preset.widgets.length}</p>
                              <p>Catégorie: {preset.category}</p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button variant="outline" asChild>
                              <Link href={`/dashboard/presets/${preset.id}`}>Détails</Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  {deletingId === preset.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Le layout prédéfini sera définitivement
                                    supprimé.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(preset.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {publicLayouts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Layouts publics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicLayouts
                      .filter((layout) => activeTab === "all" || layout.category === activeTab)
                      .map((preset) => (
                        <Card key={preset.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle>{preset.name}</CardTitle>
                            <CardDescription>{preset.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <PresetLayoutPreview preset={preset} isInteractive />
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>Widgets: {preset.widgets.length}</p>
                              <p>Catégorie: {preset.category}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                              <Link href={`/dashboard/presets/${preset.id}`}>Détails</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
