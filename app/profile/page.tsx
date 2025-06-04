"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getBrowserClient } from "@/lib/client-supabase"
import { useToast } from "@/hooks/use-toast"
import { UserProfile } from "@/components/profile/user-profile"

export const dynamic = "force-dynamic"

export default function ProfilePage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setWebsite(data.website || "")
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération du profil:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre profil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      const updates = {
        id: user.id,
        full_name: fullName,
        website,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) throw error

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Profil utilisateur</h1>
        <UserProfile />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Profil utilisateur</h1>
      <UserProfile />
    </div>
  )
}
