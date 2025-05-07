"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { uploadAvatar } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarUpdated: (url: string) => void
  userName?: string
}

export function AvatarUpload({ currentAvatarUrl, onAvatarUpdated, userName = "Utilisateur" }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  // Obtenir les initiales pour l'avatar de secours
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non pris en charge",
        description: "Veuillez sélectionner une image (JPG, PNG, GIF).",
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille du fichier (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5 Mo.",
        variant: "destructive",
      })
      return
    }

    // Créer une URL de prévisualisation
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Télécharger l'avatar
    setIsUploading(true)

    try {
      const result = await uploadAvatar(file)

      if (result.success && result.url) {
        onAvatarUpdated(result.url)
        toast({
          title: "Avatar mis à jour",
          description: "Votre avatar a été mis à jour avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de télécharger l'avatar.",
          variant: "destructive",
        })
        // Réinitialiser la prévisualisation en cas d'erreur
        setPreviewUrl(null)
      }
    } catch (error: any) {
      console.error("Exception lors du téléchargement de l'avatar:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors du téléchargement.",
        variant: "destructive",
      })
      // Réinitialiser la prévisualisation en cas d'erreur
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelPreview = () => {
    setPreviewUrl(null)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-24 h-24 border-2 border-primary/20">
        <AvatarImage
          src={previewUrl || currentAvatarUrl || ""}
          alt={`Avatar de ${userName}`}
          className="object-cover"
        />
        <AvatarFallback className="text-lg">{getInitials(userName)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center space-y-2">
        <Label
          htmlFor="avatar-upload"
          className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium ${
            isUploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4 inline" />
              Changer d'avatar
            </>
          )}
        </Label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {previewUrl && (
          <Button variant="outline" size="sm" onClick={handleCancelPreview} className="mt-2" disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. 5 Mo max.</p>
      </div>
    </div>
  )
}
