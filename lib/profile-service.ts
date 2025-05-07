"use client"

import { getBrowserClient } from "@/lib/client-supabase"
import { v4 as uuidv4 } from "uuid"

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  website: string | null
  theme: string | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  full_name?: string
  website?: string
  avatar_url?: string | null
  theme?: string
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Fonction pour télécharger un avatar
export async function uploadAvatar(file: File): Promise<UploadResult> {
  const supabase = getBrowserClient()
  if (!supabase) {
    return { success: false, error: "Client Supabase non disponible" }
  }

  try {
    // Vérifier si le bucket existe
    const { data: buckets } = await supabase.storage.listBuckets()
    const profilesBucketExists = buckets?.some((bucket) => bucket.name === "profiles")

    if (!profilesBucketExists) {
      // Créer le bucket s'il n'existe pas
      const { error: createBucketError } = await supabase.storage.createBucket("profiles", {
        public: true,
      })

      if (createBucketError) {
        console.error("Erreur lors de la création du bucket:", createBucketError)
        return { success: false, error: "Impossible de créer le bucket de stockage" }
      }
    }

    // Obtenir l'utilisateur actuel
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${uuidv4()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Télécharger le fichier
    const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Erreur lors du téléchargement:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Obtenir l'URL publique
    const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

    return {
      success: true,
      url: data.publicUrl,
    }
  } catch (error: any) {
    console.error("Exception lors du téléchargement:", error)
    return { success: false, error: error.message || "Une erreur est survenue" }
  }
}

// Fonction pour mettre à jour le profil utilisateur
export async function updateUserProfile(profileData: ProfileUpdateData) {
  const supabase = getBrowserClient()
  if (!supabase) {
    return { success: false, error: "Client Supabase non disponible" }
  }

  try {
    // Obtenir l'utilisateur actuel
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    // Mettre à jour le profil
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      return { success: false, error: error.message }
    }

    // Mettre à jour les métadonnées utilisateur pour la compatibilité
    if (profileData.full_name) {
      await supabase.auth.updateUser({
        data: { full_name: profileData.full_name },
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Exception lors de la mise à jour du profil:", error)
    return { success: false, error: error.message || "Une erreur est survenue" }
  }
}

// Hook pour utiliser le service de profil côté client
export function useProfileClient() {
  const supabase = getBrowserClient()

  return {
    // Obtenir le profil de l'utilisateur actuel
    getProfile: async (): Promise<UserProfile | null> => {
      if (!supabase) {
        throw new Error("Client Supabase non disponible")
      }

      // Obtenir l'utilisateur actuel
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Utilisateur non authentifié")
      }

      // Obtenir le profil
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error)
        throw new Error(error.message)
      }

      return data as UserProfile
    },

    // Mettre à jour le profil
    updateProfile: async (profileData: ProfileUpdateData): Promise<void> => {
      const result = await updateUserProfile(profileData)
      if (!result.success) {
        throw new Error(result.error)
      }
    },

    // Télécharger un avatar
    uploadAvatar: async (file: File): Promise<string> => {
      const result = await uploadAvatar(file)
      if (!result.success || !result.url) {
        throw new Error(result.error || "Échec du téléchargement")
      }
      return result.url
    },
  }
}
