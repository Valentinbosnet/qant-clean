"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Mettre à jour les imports pour ajouter CreditCard
import { Loader2, AlertCircle, CheckCircle, LogOut, CreditCard } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  emailVerified: string | null
  createdAt: string
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: "",
    isSubmitting: false,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isSubmitting: false,
  })

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/profile")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil")
        }

        const data = await response.json()
        setProfile(data)
        setProfileForm((prev) => ({ ...prev, name: data.name || "" }))
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger votre profil. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileForm((prev) => ({ ...prev, isSubmitting: true }))
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: profileForm.name }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setSuccess("Profil mis à jour avec succès")

      // Mettre à jour la session
      await update()
    } catch (error) {
      console.error("Erreur:", error)
      setError("Impossible de mettre à jour votre profil. Veuillez réessayer.")
    } finally {
      setProfileForm((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordForm((prev) => ({ ...prev, isSubmitting: true }))
    setError(null)
    setSuccess(null)

    // Vérifier que les mots de passe correspondent
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setPasswordForm((prev) => ({ ...prev, isSubmitting: false }))
      return
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour du mot de passe")
      }

      setSuccess("Mot de passe mis à jour avec succès")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        isSubmitting: false,
      })
    } catch (error) {
      console.error("Erreur:", error)
      setError(
        error instanceof Error ? error.message : "Impossible de mettre à jour votre mot de passe. Veuillez réessayer.",
      )
    } finally {
      setPasswordForm((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleLogout = () => {
    router.push("/logout")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement de vos paramètres...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Paramètres</h1>

      {error && (
        <Card className="bg-red-900/30 border border-red-700 mb-6">
          <CardContent className="p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="bg-green-900/30 border border-green-700 mb-6">
          <CardContent className="p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="mb-8">
        // Mettre à jour les TabsList pour ajouter l'onglet Abonnement
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-gray-700">
            Abonnement
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informations du profil</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled
                  />
                  <p className="text-gray-400 text-xs">L'adresse email ne peut pas être modifiée</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={profileForm.isSubmitting}
                  >
                    {profileForm.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le profil"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Informations du compte</CardTitle>
              <CardDescription>Détails de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Date de création</p>
                    <p className="text-white">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email vérifié</p>
                    <p className="text-white">{profile?.emailVerified ? "Oui" : "Non"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Changer le mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    minLength={6}
                  />
                  <p className="text-gray-400 text-xs">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={passwordForm.isSubmitting}
                  >
                    {passwordForm.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le mot de passe"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Déconnexion</CardTitle>
              <CardDescription>Déconnectez-vous de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        // Ajouter le contenu de l'onglet Abonnement après le TabsContent de security
        <TabsContent value="subscription">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Gérer votre abonnement</CardTitle>
              <CardDescription>Consultez et gérez les détails de votre abonnement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Accédez à notre page d'abonnement pour voir votre plan actuel, gérer vos paiements et mettre à jour
                  vos informations de facturation.
                </p>
                <Button
                  onClick={() => router.push("/settings/subscription")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gérer l'abonnement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
