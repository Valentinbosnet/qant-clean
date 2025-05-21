"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { saveAsPresetLayout } from "@/lib/preset-layouts-service"
import type { DashboardLayout } from "@/lib/dashboard-service"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Loader2 } from "lucide-react"

interface SaveAsPresetDialogProps {
  dashboardConfig: DashboardLayout
  onSave?: () => void
}

export function SaveAsPresetDialog({ dashboardConfig, onSave }: SaveAsPresetDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"simple" | "analytics" | "monitoring" | "custom">("custom")
  const [isPublic, setIsPublic] = useState(false)

  // Sauvegarder comme layout prédéfini
  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour le layout",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await saveAsPresetLayout(user, dashboardConfig, name, description, category, isPublic)

      if (result) {
        toast({
          title: "Layout sauvegardé",
          description: `Le layout "${name}" a été sauvegardé comme layout prédéfini`,
        })
        setIsOpen(false)

        // Réinitialiser le formulaire
        setName("")
        setDescription("")
        setCategory("custom")
        setIsPublic(false)

        // Appeler le callback si fourni
        if (onSave) onSave()
      } else {
        throw new Error("Échec de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du layout prédéfini:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le layout prédéfini",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder comme prédéfini
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder comme layout prédéfini</DialogTitle>
          <DialogDescription>
            Sauvegardez votre layout actuel comme un layout prédéfini que vous pourrez réutiliser ultérieurement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Nom du layout</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon layout personnalisé"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-description">Description</Label>
            <Textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Une description de votre layout..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <RadioGroup value={category} onValueChange={(value) => setCategory(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="category-simple" />
                <Label htmlFor="category-simple" className="cursor-pointer">
                  Simple
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="analytics" id="category-analytics" />
                <Label htmlFor="category-analytics" className="cursor-pointer">
                  Analytique
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monitoring" id="category-monitoring" />
                <Label htmlFor="category-monitoring" className="cursor-pointer">
                  Surveillance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="category-custom" />
                <Label htmlFor="category-custom" className="cursor-pointer">
                  Personnalisé
                </Label>
              </div>
            </RadioGroup>
          </div>

          {user && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <Label htmlFor="is-public" className="cursor-pointer">
                Rendre ce layout public (visible par tous les utilisateurs)
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
