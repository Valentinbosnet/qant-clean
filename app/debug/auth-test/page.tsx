"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthTestPage() {
  const [supabaseTest, setSupabaseTest] = useState<any>(null)
  const [supabaseLoading, setSupabaseLoading] = useState(false)

  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" })
  const [registerResult, setRegisterResult] = useState<any>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  const [verifyData, setVerifyData] = useState({ token: "" })
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const [emailData, setEmailData] = useState({ email: "" })
  const [emailResult, setEmailResult] = useState<any>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  // Test de connexion Supabase
  const testSupabase = async () => {
    setSupabaseLoading(true)
    try {
      const res = await fetch("/api/debug/test-supabase")
      const data = await res.json()
      setSupabaseTest(data)
    } catch (error) {
      setSupabaseTest({ error: "Erreur lors du test de connexion" })
    } finally {
      setSupabaseLoading(false)
    }
  }

  // Inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })
      const data = await res.json()
      setRegisterResult(data)
    } catch (error: any) {
      setRegisterResult({ error: error.message || "Erreur lors de l'inscription" })
    } finally {
      setRegisterLoading(false)
    }
  }

  // Vérification d'email
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyLoading(true)
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyData),
      })
      const data = await res.json()
      setVerifyResult(data)
    } catch (error: any) {
      setVerifyResult({ error: error.message || "Erreur lors de la vérification" })
    } finally {
      setVerifyLoading(false)
    }
  }

  // Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()
      setLoginResult(data)
    } catch (error: any) {
      setLoginResult({ error: error.message || "Erreur lors de la connexion" })
    } finally {
      setLoginLoading(false)
    }
  }

  // Test d'envoi d'email
  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    try {
      const res = await fetch("/api/debug/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      })
      const data = await res.json()
      setEmailResult(data)
    } catch (error: any) {
      setEmailResult({ error: error.message || "Erreur lors de l'envoi de l'email" })
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test d&apos;Authentification</h1>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test de Connexion Supabase</CardTitle>
            <CardDescription>
              Vérifiez si la connexion à Supabase fonctionne correctement et si les tables requises existent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testSupabase} disabled={supabaseLoading}>
              {supabaseLoading ? "Test en cours..." : "Tester la Connexion Supabase"}
            </Button>

            {supabaseTest && (
              <div className="mt-4 p-4 rounded bg-gray-100">
                <pre className="whitespace-pre-wrap">{JSON.stringify(supabaseTest, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="register">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="register">Inscription</TabsTrigger>
          <TabsTrigger value="verify">Vérifier Email</TabsTrigger>
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="email">Test Email</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
              <CardDescription>Créez un nouveau compte utilisateur.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="********"
                    required
                  />
                </div>

                <Button type="submit" disabled={registerLoading}>
                  {registerLoading ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </form>

              {registerResult && (
                <div
                  className={`mt-4 p-4 rounded ${registerResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {registerResult.success ? registerResult.message : registerResult.error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Vérifier Email</CardTitle>
              <CardDescription>Vérifiez votre adresse email avec le code reçu.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Code de vérification</Label>
                  <Input
                    id="token"
                    value={verifyData.token}
                    onChange={(e) => setVerifyData({ token: e.target.value })}
                    placeholder="123456"
                    required
                  />
                </div>

                <Button type="submit" disabled={verifyLoading}>
                  {verifyLoading ? "Vérification en cours..." : "Vérifier l'email"}
                </Button>
              </form>

              {verifyResult && (
                <div
                  className={`mt-4 p-4 rounded ${verifyResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {verifyResult.success ? verifyResult.message : verifyResult.error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>Connectez-vous à votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="********"
                    required
                  />
                </div>

                <Button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>

              {loginResult && (
                <div
                  className={`mt-4 p-4 rounded ${loginResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  <pre className="whitespace-pre-wrap">{JSON.stringify(loginResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Test d&apos;Envoi d&apos;Email</CardTitle>
              <CardDescription>Testez l&apos;envoi d&apos;email avec Mailjet.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <Button type="submit" disabled={emailLoading}>
                  {emailLoading ? "Envoi en cours..." : "Envoyer un email de test"}
                </Button>
              </form>

              {emailResult && (
                <div
                  className={`mt-4 p-4 rounded ${emailResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {emailResult.success ? emailResult.message : emailResult.error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
