"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getTemplateById, type DashboardTemplate } from "@/lib/dashboard-templates"
import { createDashboardLayout } from "@/lib/dashboard-service"
import { TemplatePreview } from "@/components/dashboard/template-preview"
import { AccessibilityInfo } from "@/components/dashboard/accessibility-info"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, Info, Loader2, LayoutGrid } from "lucide-react"
import Link from "next/link"
import type { AccessibilityMode } from "@/components/dashboard/accessibility-controls"

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [template, setTemplate] = useState<DashboardTemplate | null>(null)
  const [layoutName, setLayoutName] = useState("")
  const [makeDefault, setMakeDefault] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>("none")

  // Charger le modèle
  useEffect(() => {
    const templateData = getTemplateById(params.id)
    if (templateData) {
      setTemplate(templateData)
      setLayoutName(`${templateData.name} - ${new Date().toLocaleDateString()}`)
    }
    setIsLoading(false)
  }, [params.id])

  // Créer un nouveau layout basé sur le modèle
  const handleCreateFromTemplate = async () => {
    if (!template || !user) return

    setIsCreating(true)
    try {
      const newLayout = await createDashboardLayout(user, layoutName, template.widgets, makeDefault)

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
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du modèle...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Modèle non trouvé</h1>
          <p className="text-muted-foreground mb-6">Le modèle que vous recherchez n'existe pas.</p>
          <Button asChild>
            <Link href="/dashboard/templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux modèles
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/dashboard/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux modèles
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Prévisualisation du modèle</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TemplatePreview template={template} interactive={true} onAccessibilityChange={setAccessibilityMode} />

          <AccessibilityInfo mode={accessibilityMode} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Appliquer ce modèle</CardTitle>
              <CardDescription>Créez un nouveau tableau de bord basé sur ce modèle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
              <Button
                onClick={handleCreateFromTemplate}
                disabled={isCreating || !layoutName.trim() || !user}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Appliquer ce modèle
                  </>
                )}
              </Button>

              {!user && (
                <div className="bg-amber-50 p-3 rounded-md flex items-start space-x-2 border border-amber-200">
                  <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Vous devez être connecté pour créer un tableau de bord.{" "}
                    <Link href="/auth" className="font-medium underline">
                      Se connecter
                    </Link>
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails du modèle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Catégorie</div>
                <div className="font-medium">
                  {template.category === "beginner"
                    ? "Débutant"
                    : template.category === "intermediate"
                      ? "Intermédiaire"
                      : template.category === "advanced"
                        ? "Avancé"
                        : "Spécialisé"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Nombre de widgets</div>
                <div className="font-medium">{template.widgets.length}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Widgets inclus</div>
                <ul className="space-y-2">
                  {template.widgets.map((widget, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                      <span>{widget.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
