"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/client-supabase"
import { updateUserProfile, type UserProfile } from "@/lib/profile-service"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ThemeSelector } from "@/components/profile/theme-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User, Globe, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    website: "",
    theme: "system",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true)

      try {
        const supabase = getBrowserClient()

        if (!supabase) {
          toast({
            title: "Erreur",
            description: "Impossible de se connecter à Supabase",
            variant: "destructive",
          })
          router.push("/auth")
          return
        }

        // Récupérer l'utilisateur actuel
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth")
          return
        }

        setUser(currentUser)

        // Récupérer le profil
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Erreur lors de la récupération du profil:", error)
          toast({
            title: "Erreur",
            description: "Impossible de récupérer votre profil",
            variant: "destructive",
          })
          return
        }

        setProfile(profileData as UserProfile)
        setFormData({
          full_name: profileData.full_name || "",
          website: profileData.website || "",
          theme: profileData.theme || "system",
        })
      } catch (error) {
        console.error("Exception lors de la récupération du profil:", error)
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement de votre profil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThemeChange = (theme: string) => {
    setFormData((prev) => ({ ...prev, theme }))
  }

  const handleAvatarUpdated = (url: string) => {
    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null))
    toast({
      title: "Avatar mis à jour",
      description: "Votre avatar a été mis à jour avec succès",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateUserProfile({
        full_name: formData.full_name,
        website: formData.website,
        theme: formData.theme,
      })

      if (result.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        })

        // Mettre à jour le profil local
        setProfile((prev) => (prev ? { ...prev, ...formData } : null))
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de mettre à jour votre profil",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Exception lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Profil utilisateur</h1>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="mr-2 h-4 w-4" />
            Informations personnelles
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="account">
            <Globe className="mr-2 h-4 w-4" />
            Compte
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles et votre avatar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    onAvatarUpdated={handleAvatarUpdated}
                    userName={profile?.full_name || user?.email}
                  />

                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nom complet</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        placeholder="Votre nom complet"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ""} disabled />
                      <p className="text-sm text-muted-foreground">L'email ne peut pas être modifié.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Thème</Label>
                  <ThemeSelector currentTheme={formData.theme} onThemeChange={handleThemeChange} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Compte</CardTitle>
                <CardDescription>Gérez les paramètres de votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://votre-site.com"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="created_at">Date de création du compte</Label>
                    <Input
                      id="created_at"
                      value={new Date(user?.created_at || profile?.created_at || Date.now()).toLocaleDateString()}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
