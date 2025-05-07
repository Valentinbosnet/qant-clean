"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Key, LogOut } from "lucide-react"
import Link from "next/link"
import { getBrowserClient } from "@/lib/supabase"
// Importez le composant EmailVerificationStatus
import { EmailVerificationStatus } from "@/components/email-verification-status"

export default function ProfilePage() {
  const { user, signOut, isLoading, refreshSession } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      })

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      await refreshSession()

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

    if (!user) return

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

  if (isLoading) {
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
      {/* Ajoutez-le juste après le titre de la page, avant les onglets */}
      <h1 className="text-3xl font-bold mb-8">Profil</h1>
      <EmailVerificationStatus />

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-2" />
              Informations
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
                <CardContent className="space-y-4">
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
