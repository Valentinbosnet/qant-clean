"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Key, LogOut, Palette, LinkIcon } from "lucide-react"
import Link from "next/link"
import { EmailVerificationStatus } from "@/components/email-verification-status"
import { getClientSupabase } from "@/lib/client-supabase"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ThemeSelector } from "@/components/profile/theme-selector"
import { useProfileClient } from "@/lib/profile-service"

export default function ProfilePage() {
  const { user, signOut, isLoading, refreshSession } = useAuth()
  const { toast } = useToast()
  const profileClient = useProfileClient()

  const [isUpdating, setIsUpdating] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Formulaire profil
  const [displayName, setDisplayName] = useState("")
  const [website, setWebsite] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [theme, setTheme] = useState<string>("system")

  // Formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // S'assurer que nous sommes côté client et charger le profil
  useEffect(() => {
    setIsClient(true)

    if (user) {
      loadProfile()
    }
  }, [user])

  // Charger le profil depuis Supabase
  const loadProfile = async () => {
    if (!user) return

    setIsLoadingProfile(true)

    try {
      const profileData = await profileClient.getProfile()
      setProfile(profileData)

      // Initialiser les champs du formulaire
      setDisplayName(profileData?.full_name || "")
      setWebsite(profileData?.website || "")
      setAvatarUrl(profileData?.avatar_url || null)
      setTheme(profileData?.theme || "system")
    } catch (error: any) {
      console.error("Erreur lors du chargement du profil:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !isClient) return

    setIsUpdating(true)

    try {
      // Mettre à jour le profil dans Supabase
      await profileClient.updateProfile({
        full_name: displayName,
        website: website,
        avatar_url: avatarUrl,
        theme: theme,
      })

      // Mettre à jour les métadonnées utilisateur pour la compatibilité
      const supabase = getClientSupabase()
      if (!supabase) {
        throw new Error("Client Supabase non disponible")
      }

      await supabase.auth.updateUser({
        data: { full_name: displayName },
      })

      await refreshSession()

      // Recharger le profil
      await loadProfile()

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !isClient) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        throw new Error("Client Supabase non disponible")
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Afficher un état de chargement jusqu'à ce que le composant soit monté côté client
  if (!isClient) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Authentification requise</h2>
          <p className="mb-6">Veuillez vous connecter pour accéder à votre profil.</p>
          <Button asChild>
            <Link href="/auth">Se connecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Profil</h1>
      <EmailVerificationStatus />

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="security">
              <Key className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <AvatarUpload initialAvatarUrl={avatarUrl} onAvatarChange={(url) => setAvatarUrl(url)} />

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email} disabled />
                    <p className="text-xs text-muted-foreground mt-1">L'adresse email ne peut pas être modifiée</p>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Nom complet</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Site web</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <LinkIcon className="h-4 w-4" />
                      </span>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://votresite.com"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ID du compte</Label>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>

                  <div>
                    <Label>Compte créé le</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <ThemeSelector initialTheme={theme} onThemeChange={(value) => setTheme(value)} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Le mot de passe doit contenir au moins 6 caractères</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le mot de passe"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Déconnexion</CardTitle>
                <CardDescription>Déconnectez-vous de votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Vous serez déconnecté de tous les appareils.</p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
