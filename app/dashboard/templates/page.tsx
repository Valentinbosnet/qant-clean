"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getAllTemplates, getTemplatesByCategory, type DashboardTemplate } from "@/lib/dashboard-templates"
import { createDashboardLayout } from "@/lib/dashboard-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Info, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DashboardTemplatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<DashboardTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [layoutName, setLayoutName] = useState("")
  const [makeDefault, setMakeDefault] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Charger les modèles
  useEffect(() => {
    const allTemplates = getAllTemplates()
    setTemplates(allTemplates)
  }, [])

  // Filtrer les modèles par catégorie
  const filterTemplates = (category: string) => {
    if (category === "all") {
      setTemplates(getAllTemplates())
    } else {
      setTemplates(getTemplatesByCategory(category))
    }
    setActiveTab(category)
  }

  // Sélectionner un modèle
  const handleSelectTemplate = (template: DashboardTemplate) => {
    setSelectedTemplate(template)
    setLayoutName(`${template.name} - ${new Date().toLocaleDateString()}`)
    setIsDialogOpen(true)
  }

  // Créer un nouveau layout basé sur le modèle
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !user) return

    setIsCreating(true)
    try {
      const newLayout = await createDashboardLayout(user, layoutName, selectedTemplate.widgets, makeDefault)

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
      console.error("Erreur lors de la création du layout:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le layout",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Modèles de Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">
            Choisissez un modèle prédéfini pour créer rapidement un tableau de bord adapté à vos besoins
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={filterTemplates} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="beginner">Débutant</TabsTrigger>
          <TabsTrigger value="intermediate">Intermédiaire</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
          <TabsTrigger value="specialized">Spécialisé</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <strong>Widgets:</strong> {template.widgets.length}
                    </p>
                    <p>
                      <strong>Catégorie:</strong>{" "}
                      {template.category === "beginner"
                        ? "Débutant"
                        : template.category === "intermediate"
                          ? "Intermédiaire"
                          : template.category === "advanced"
                            ? "Avancé"
                            : "Spécialisé"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/templates/${template.id}`)}
                    className="flex-1"
                  >
                    Prévisualiser
                  </Button>
                  <Button onClick={() => handleSelectTemplate(template)} className="flex-1">
                    Utiliser
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un tableau de bord à partir du modèle</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de créer un nouveau tableau de bord basé sur le modèle "{selectedTemplate?.name}".
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

            <div className="bg-muted p-3 rounded-md flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Ce modèle créera un nouveau tableau de bord avec {selectedTemplate?.widgets.length} widgets
                préconfigurés. Vous pourrez personnaliser ce tableau de bord après sa création.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFromTemplate} disabled={isCreating || !layoutName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le tableau de bord"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
