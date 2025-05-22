"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getBrowserClient } from "@/lib/client-supabase"
import { useToast } from "@/hooks/use-toast"
import { ThemeSelector } from "@/components/profile/theme-selector"
import { AvatarUpload } from "@/components/profile/avatar-upload"

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
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>Mon profil</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Informations personnelles</h2>
              <p style={{ color: "#64748b" }}>Connectez-vous pour voir votre profil</p>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <p>Veuillez vous connecter pour accéder à votre profil.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>Mon profil</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Informations personnelles</h2>
            <p style={{ color: "#64748b" }}>Mettez à jour vos informations personnelles</p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div style={{ spaceY: "2rem" }}>
              <div style={{ spaceY: "1rem" }}>
                <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Email
                </label>
                <input
                  id="email"
                  value={user.email}
                  disabled
                  style={{ padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}
                />
              </div>

              <div style={{ spaceY: "1rem" }}>
                <label htmlFor="fullName" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Nom complet
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  style={{ padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}
                />
              </div>

              <div style={{ spaceY: "1rem" }}>
                <label htmlFor="website" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Site web
                </label>
                <input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://votresite.com"
                  style={{ padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}
                />
              </div>

              <button
                onClick={updateProfile}
                disabled={loading}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.25rem",
                  background: "#60a5fa",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#ffffff",
                        animation: "spin 1s linear infinite",
                      }}
                    ></span>{" "}
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={{ spaceY: "2rem" }}>
          <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url} />
          <ThemeSelector userId={user.id} currentTheme={profile?.theme} />
        </div>
      </div>
    </div>
  )
}
