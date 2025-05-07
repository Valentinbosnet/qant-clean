"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase-config"
import { useAuth } from "@/contexts/auth-context"

interface AvatarUploadProps {
  initialAvatarUrl: string | null
  onAvatarChange: (url: string | null) => void
}

export function AvatarUpload({ initialAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getBrowserClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 2MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)
      const newAvatarUrl = data.publicUrl

      // Mettre à jour l'URL de l'avatar
      setAvatarUrl(newAvatarUrl)
      onAvatarChange(newAvatarUrl)

      toast({
        title: "Avatar mis à jour",
        description: "Votre avatar a été mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'avatar:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || !user) return

    try {
      // Extraire le chemin du fichier de l'URL
      const filePathMatch = avatarUrl.match(/\/profiles\/([^?]+)/)
      if (filePathMatch && filePathMatch[1]) {
        const filePath = filePathMatch[1]

        // Supprimer le fichier
        const { error } = await supabase.storage.from("profiles").remove([filePath])
        if (error) throw error
      }

      // Mettre à jour l'URL de l'avatar
      setAvatarUrl(null)
      onAvatarChange(null)

      toast({
        title: "Avatar supprimé",
        description: "Votre avatar a été supprimé avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'avatar:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    }
  }

  // Obtenir les initiales pour l'avatar fallback
  const getInitials = () => {
    if (!user) return "U"
    const fullName = user.user_metadata?.full_name || user.email || ""
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || ""} alt="Avatar" />
        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("avatar-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Téléchargement...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Changer l'avatar
            </>
          )}
        </Button>

        {avatarUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        )}

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}
