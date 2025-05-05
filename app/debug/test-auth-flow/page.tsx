"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestAuthFlowPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({})
  const [loading, setLoading] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<any>(null)

  // Register a new user
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus({})

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          success: true,
          message: "Inscription réussie ! Veuillez vérifier votre email pour le code de vérification.",
        })
      } else {
        setStatus({ success: false, message: data.error || "Erreur lors de l'inscription" })
      }
    } catch (error) {
      setStatus({ success: false, message: "Erreur de connexion au serveur" })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Verify email with code
  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus({})

    try {
      const response = await fetch(`/api/verify-email?token=${verificationCode}`)
      const data = await response.json()

      if (response.ok) {
        setStatus({
          success: true,
          message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
        })
      } else {
        setStatus({ success: false, message: data.error || "Erreur lors de la vérification" })
      }
    } catch (error) {
      setStatus({ success: false, message: "Erreur de connexion au serveur" })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Test sending an email
  async function handleTestEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTestEmailResult(null)

    try {
      const response = await fetch("/api/test-resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "Test Email",
          message: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Test Email</h2>
            <p>Ceci est un email de test envoyé depuis votre application.</p>
            <p>Heure: ${new Date().toLocaleString()}</p>
          </div>`,
        }),
      })

      const data = await response.json()
      setTestEmailResult(data)
    } catch (error) {
      setTestEmailResult({ error: "Erreur de connexion au serveur" })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Check database tables
  async function checkDatabaseTables() {
    setLoading(true)
    setStatus({})

    try {
      const response = await fetch("/api/debug/db-status")
      const data = await response.json()

      if (response.ok) {
        setStatus({
          success: true,
          message: `Tables trouvées: ${data.tables.join(", ")}`,
        })
      } else {
        setStatus({ success: false, message: data.error || "Erreur lors de la vérification des tables" })
      }
    } catch (error) {
      setStatus({ success: false, message: "Erreur de connexion au serveur" })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test du flux d'authentification</h1>

      <Tabs defaultValue="register">
        <TabsList className="mb-4">
          <TabsTrigger value="register">Inscription</TabsTrigger>
          <TabsTrigger value="verify">Vérification</TabsTrigger>
          <TabsTrigger value="email">Test Email</TabsTrigger>
          <TabsTrigger value="database">Base de données</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
              <CardDescription>Créer un nouveau compte utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Chargement..." : "S'inscrire"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Vérification d'email</CardTitle>
              <CardDescription>Entrez le code reçu par email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de vérification</Label>
                  <Input
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Vérification..." : "Vérifier l'email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Test d'envoi d'email</CardTitle>
              <CardDescription>Envoyer un email de test</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email de destination</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Envoi..." : "Envoyer un email de test"}
                </Button>
              </form>

              {testEmailResult && (
                <div className="mt-4">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                    {JSON.stringify(testEmailResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Vérification de la base de données</CardTitle>
              <CardDescription>Vérifier les tables dans Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={checkDatabaseTables} disabled={loading} className="w-full">
                {loading ? "Vérification..." : "Vérifier les tables"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {status.message && (
        <Alert className="mt-6" variant={status.success ? "default" : "destructive"}>
          <AlertTitle>{status.success ? "Succès" : "Erreur"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
