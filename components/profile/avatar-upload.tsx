"use client"

import type React from "react"

import { useState } from "react"
import { getBrowserClient } from "@/lib/client-supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface AvatarUploadProps {
  userId: string
  avatarUrl?: string
}

export function AvatarUpload({ userId, avatarUrl }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(avatarUrl || null)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image à télécharger.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${userId}/${uuidv4()}.${fileExt}`

      // Créer le bucket s'il n'existe pas
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("avatars")

      if (bucketError && bucketError.message.includes("does not exist")) {
        await supabase.storage.createBucket("avatars", {
          public: true,
        })
      }

      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Mettre à jour le profil avec la nouvelle URL d'avatar
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId)

      if (updateError) {
        throw updateError
      }

      setAvatar(data.publicUrl)
      toast({
        title: "Avatar mis à jour",
        description: "Votre avatar a été mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'avatar:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger l'avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    try {
      setUploading(true)

      // Mettre à jour le profil pour supprimer l'URL d'avatar
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)

      if (updateError) {
        throw updateError
      }

      setAvatar(null)
      toast({
        title: "Avatar supprimé",
        description: "Votre avatar a été supprimé avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'avatar:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>Téléchargez ou mettez à jour votre avatar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar || undefined} alt="Avatar" />
            <AvatarFallback>{userId.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Téléchargement...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Télécharger
                </>
              )}
            </Button>
            {avatar && (
              <Button variant="outline" size="sm" onClick={removeAvatar} disabled={uploading}>
                <X className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
