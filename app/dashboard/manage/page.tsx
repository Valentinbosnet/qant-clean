"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  getUserDashboardLayouts,
  createDashboardLayout,
  deleteDashboardLayout,
  setDefaultDashboardLayout,
  type DashboardLayout,
} from "@/lib/dashboard-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { CheckCircle, Edit, Trash2, Star, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ManageDashboardLayouts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [layouts, setLayouts] = useState<DashboardLayout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newLayoutName, setNewLayoutName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Charger les layouts
  useEffect(() => {
    async function loadLayouts() {
      if (!user) return

      setIsLoading(true)
      try {
        const userLayouts = await getUserDashboardLayouts(user)
        setLayouts(userLayouts)
      } catch (error) {
        console.error("Erreur lors du chargement des layouts:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos layouts de tableau de bord",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLayouts()
  }, [user, toast])

  // Créer un nouveau layout
  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour le layout",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const newLayout = await createDashboardLayout(user, newLayoutName)
      if (newLayout) {
        setLayouts((prev) => [...prev, newLayout])
        setNewLayoutName("")
        setIsDialogOpen(false)
        toast({
          title: "Layout créé",
          description: `Le layout "${newLayoutName}" a été créé avec succès`,
        })
      } else {
        throw new Error("Impossible de créer le layout")
      }
    } catch (error) {
      console.error("Erreur lors de la création du layout:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le layout",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Supprimer un layout
  const handleDeleteLayout = async (layoutId: string, layoutName: string) => {
    try {
      const success = await deleteDashboardLayout(user, layoutId)
      if (success) {
        setLayouts((prev) => prev.filter((layout) => layout.id !== layoutId))
        toast({
          title: "Layout supprimé",
          description: `Le layout "${layoutName}" a été supprimé`,
        })
      } else {
        throw new Error("Impossible de supprimer le layout")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du layout:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le layout",
        variant: "destructive",
      })
    }
  }

  // Définir un layout comme layout par défaut
  const handleSetDefaultLayout = async (layoutId: string, layoutName: string) => {
    try {
      const success = await setDefaultDashboardLayout(user, layoutId)
      if (success) {
        setLayouts((prev) =>
          prev.map((layout) => ({
            ...layout,
            isDefault: layout.id === layoutId,
          })),
        )
        toast({
          title: "Layout par défaut",
          description: `"${layoutName}" est maintenant votre layout par défaut`,
        })
      } else {
        throw new Error("Impossible de définir le layout par défaut")
      }
    } catch (error) {
      console.error("Erreur lors de la définition du layout par défaut:", error)
      toast({
        title: "Erreur",
        description: "Impossible de définir le layout par défaut",
        variant: "destructive",
      })
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gérer les Layouts de Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">
            Créez, modifiez et supprimez vos configurations de tableau de bord
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Layout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau layout</DialogTitle>
                <DialogDescription>
                  Donnez un nom à votre nouveau layout de tableau de bord. Il sera créé avec les widgets par défaut.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="layout-name">Nom du layout</Label>
                <Input
                  id="layout-name"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder="Mon layout personnalisé"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateLayout} disabled={isCreating || !newLayoutName.trim()}>
                  {isCreating ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vos Layouts</CardTitle>
          <CardDescription>
            Vous pouvez avoir plusieurs configurations de tableau de bord et basculer entre elles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Vous n'avez pas encore de layouts personnalisés.</p>
            </div>
          ) : (
            <Table>
              <TableCaption>Liste de vos layouts de tableau de bord</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Widgets</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead>Par défaut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {layouts.map((layout) => (
                  <TableRow key={layout.id}>
                    <TableCell className="font-medium">{layout.name}</TableCell>
                    <TableCell>{layout.widgets.length} widgets</TableCell>
                    <TableCell>{formatDate(layout.lastUpdated)}</TableCell>
                    <TableCell>
                      {layout.isDefault ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">Par défaut</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild title="Modifier">
                          <Link href={`/dashboard?layout=${layout.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {!layout.isDefault && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSetDefaultLayout(layout.id, layout.name)}
                            title="Définir comme layout par défaut"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              title="Supprimer"
                              disabled={layouts.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement le layout "
                                {layout.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteLayout(layout.id, layout.name)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
