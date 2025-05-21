"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getPresetLayouts, applyPresetLayout, type PresetLayout } from "@/lib/preset-layouts-service"
import { createDashboardLayout } from "@/lib/dashboard-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PresetLayoutPreview } from "@/components/dashboard/preset-layout-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Copy, Globe, Loader2, User } from "lucide-react"
import Link from "next/link"

export default function PresetLayoutDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [preset, setPreset] = useState<PresetLayout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [layoutName, setLayoutName] = useState("")
  const [makeDefault, setMakeDefault] = useState(false)

  // Charger le layout prédéfini
  useEffect(() => {
    async function loadPresetLayout() {
      setIsLoading(true)
      try {
        const layouts = await getPresetLayouts(user)
        const selectedPreset = layouts.find((layout) => layout.id === id)

        if (selectedPreset) {
          setPreset(selectedPreset)
          setLayoutName(`${selectedPreset.name} - ${new Date().toLocaleDateString()}`)
        } else {
          toast({
            title: "Erreur",
            description: "Layout prédéfini introuvable",
            variant: "destructive",
          })
          router.push("/dashboard/presets")
        }
      } catch (error) {
        console.error("Erreur lors du chargement du layout prédéfini:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger le layout prédéfini",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadPresetLayout()
    }
  }, [id, user, toast, router])

  // Appliquer le layout prédéfini
  const handleApplyPreset = async () => {
    if (!preset || !user) return

    setIsApplying(true)
    try {
      // Créer un nouveau layout basé sur le preset
      const newLayout = await createDashboardLayout(user, layoutName, applyPresetLayout(preset), makeDefault)

      if (newLayout) {
        toast({
          title: "Layout créé",
          description: `Le layout "${layoutName}" a été créé avec succès`,
        })

        // Rediriger vers le nouveau layout
        router.push(`/dashboard?layout=${newLayout.id}`)
      } else {
        throw new Error("Impossible de créer le layout")
      }
    } catch (error) {
      console.error("Erreur lors de l'application du layout prédéfini:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le layout prédéfini",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
      setIsDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" asChild className="mr-4">
            <Link href="/dashboard/presets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-[200px] w-full rounded-md mb-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (!preset) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/presets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Layout introuvable</h2>
          <p className="text-muted-foreground mb-6">
            Le layout prédéfini que vous recherchez n'existe pas ou n'est pas accessible.
          </p>
          <Button asChild>
            <Link href="/dashboard/presets">Voir tous les layouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" asChild className="mr-4">
            <Link href="/dashboard/presets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{preset.name}</h1>
          {preset.isPublic && (
            <Badge variant="outline" className="ml-3">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du layout</CardTitle>
              <CardDescription>Ce layout contient {preset.widgets.length} widgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-muted/20">
                <PresetLayoutPreview preset={preset} isInteractive />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1">{preset.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Catégorie</dt>
                  <dd className="mt-1 capitalize">{preset.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nombre de widgets</dt>
                  <dd className="mt-1">{preset.widgets.length}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Créé par</dt>
                  <dd className="mt-1 flex items-center">
                    {preset.createdBy === user?.id ? (
                      <>
                        <User className="h-4 w-4 mr-1" />
                        Vous
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-1" />
                        Autre utilisateur
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date de création</dt>
                  <dd className="mt-1">{new Date(preset.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Button className="w-full mb-3" onClick={() => setIsDialogOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Appliquer ce layout
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer le layout prédéfini</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de créer un nouveau tableau de bord basé sur le layout "{preset.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Nom du tableau de bord</Label>
              <Input
                id="layout-name"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Mon tableau de bord"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="make-default"
                checked={makeDefault}
                onCheckedChange={(checked) => setMakeDefault(checked as boolean)}
              />
              <Label htmlFor="make-default" className="cursor-pointer">
                Définir comme tableau de bord par défaut
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApplyPreset} disabled={isApplying || !layoutName.trim()}>
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Application...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Appliquer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
