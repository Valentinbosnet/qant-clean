"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabaseFetch } from "@/lib/supabase-proxy"
import { isOfflineMode, authenticateOfflineUser, addOfflineUser, isOfflineAuthenticated } from "@/lib/offline-mode"

// Schémas de validation
const emailSchema = z.string().email({ message: "Adresse email invalide" })
const passwordSchema = z
  .string()
  .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
  .max(100, { message: "Le mot de passe est trop long" })

interface DirectAuthFormProps {
  defaultTab?: "signin" | "signup"
}

export function DirectAuthForm({ defaultTab = "signin" }: DirectAuthFormProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // S'assurer que nous sommes côté client et vérifier le mode hors ligne
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const isOffline = isOfflineMode()
      setOfflineMode(isOffline)
    }
    console.log("DirectAuthForm monté côté client")
  }, [])

  // Rediriger si déjà authentifié en mode hors ligne
  useEffect(() => {
    if (isClient && offlineMode && isOfflineAuthenticated()) {
      router.push("/")
    }
  }, [isClient, offlineMode, router])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    let isValid = true

    try {
      emailSchema.parse(email)
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message
        isValid = false
      }
    }

    try {
      passwordSchema.parse(password)
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Tentative de connexion avec:", email)
    setDebugInfo("Tentative de connexion...")
    setNetworkError(null)

    if (!validateForm() || !isClient) {
      setDebugInfo("Validation du formulaire échouée ou composant non monté côté client")
      return
    }

    setIsLoading(true)
    setDebugInfo("Chargement en cours...")

    // Si le mode hors ligne est activé, utiliser l'authentification hors ligne
    if (offlineMode) {
      try {
        const user = authenticateOfflineUser(email, password)
        toast({
          title: "Connexion réussie (Mode hors ligne)",
          description: "Bienvenue sur votre tableau de bord !",
        })
        router.push("/")
      } catch (error: any) {
        toast({
          title: "Échec de connexion",
          description: error.message || "Email ou mot de passe incorrect",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      // Récupérer les variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Variables d'environnement Supabase manquantes")
      }

      // Utiliser notre fonction supabaseFetch qui gère les problèmes de connectivité
      const response = await supabaseFetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      // Vérifier si c'est une erreur réseau simulée
      if (data.error === "network_error") {
        setNetworkError(data.error_description || data.message || "Problème de connexion au serveur")
        setDebugInfo(`Erreur réseau: ${data.error_description || data.message}`)

        toast({
          title: "Problème de connexion",
          description: "Nous vous suggérons d'activer le mode hors ligne",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        setDebugInfo(`Erreur de connexion: ${data.error || response.statusText}`)
        console.error("Erreur de connexion:", data)

        if (data.error_description && data.error_description.includes("Email not confirmed")) {
          setRegistrationSuccess(true)
          setRegisteredEmail(email)
          toast({
            title: "Email non vérifié",
            description: "Veuillez vérifier votre email avant de vous connecter",
            variant: "warning",
          })
        } else {
          toast({
            title: "Échec de connexion",
            description: data.error_description || data.error || "Email ou mot de passe incorrect",
            variant: "destructive",
          })
        }
      } else {
        setDebugInfo("Connexion réussie, redirection...")

        // Stocker le token dans le localStorage
        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
          }),
        )

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord !",
        })

        // Rediriger vers la page d'accueil
        router.push("/")
      }
    } catch (error: any) {
      console.error("Exception lors de la connexion directe:", error)
      setDebugInfo(`Exception: ${error.message || "Erreur inconnue"}`)
      setNetworkError(error.message || "Une erreur réseau s'est produite")

      toast({
        title: "Échec de connexion",
        description: "Nous vous suggérons d'activer le mode hors ligne",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Tentative d'inscription avec:", email)
    setDebugInfo("Tentative d'inscription...")
    setNetworkError(null)

    if (!validateForm() || !isClient) {
      setDebugInfo("Validation du formulaire échouée ou composant non monté côté client")
      return
    }

    setIsLoading(true)
    setDebugInfo("Chargement en cours...")

    // Si le mode hors ligne est activé, créer un utilisateur hors ligne
    if (offlineMode) {
      try {
        const user = addOfflineUser(email)
        // Authentifier immédiatement l'utilisateur après l'inscription
        authenticateOfflineUser(email, password)

        setRegistrationSuccess(true)
        setRegisteredEmail(email)

        toast({
          title: "Inscription réussie (Mode hors ligne)",
          description: "Votre compte a été créé avec succès. Vous êtes maintenant connecté.",
        })

        // Rediriger l'utilisateur après une courte période
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } catch (error: any) {
        toast({
          title: "Échec de l'inscription",
          description: error.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      // Récupérer les variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Variables d'environnement Supabase manquantes")
      }

      // Utiliser notre fonction supabaseFetch qui gère les problèmes de connectivité
      const response = await supabaseFetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password,
          data: {},
          gotrue_meta_security: {},
          redirect_to: `${window.location.origin}/auth/callback`,
        }),
      })

      const data = await response.json()

      // Vérifier si c'est une erreur réseau simulée
      if (data.error === "network_error") {
        setNetworkError(data.error_description || data.message || "Problème de connexion au serveur")
        setDebugInfo(`Erreur réseau: ${data.error_description || data.message}`)

        toast({
          title: "Problème de connexion",
          description: "Nous vous suggérons d'activer le mode hors ligne",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        setDebugInfo(`Erreur d'inscription: ${data.error || response.statusText}`)
        console.error("Erreur d'inscription:", data)

        if (data.msg && data.msg.includes("already registered")) {
          toast({
            title: "Inscription impossible",
            description: "Un compte existe déjà avec cette adresse email",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Échec de l'inscription",
            description: data.error_description || data.error || "Une erreur est survenue lors de l'inscription",
            variant: "destructive",
          })
        }
      } else {
        setDebugInfo("Inscription réussie, email envoyé")
        setRegistrationSuccess(true)
        setRegisteredEmail(email)
        toast({
          title: "Inscription réussie",
          description: "Un email de vérification a été envoyé à votre adresse email",
        })
      }
    } catch (error: any) {
      console.error("Exception lors de l'inscription directe:", error)
      setDebugInfo(`Exception: ${error.message || "Erreur inconnue"}`)
      setNetworkError(error.message || "Une erreur réseau s'est produite")

      toast({
        title: "Échec de l'inscription",
        description: "Nous vous suggérons d'activer le mode hors ligne",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerificationEmail = async () => {
    if (!registeredEmail || !isClient) return

    setIsLoading(true)
    setNetworkError(null)

    // En mode hors ligne, simuler l'envoi
    if (offlineMode) {
      setTimeout(() => {
        toast({
          title: "Email envoyé (simulation)",
          description: "En mode hors ligne, aucun email n'est réellement envoyé.",
        })
        setIsLoading(false)
      }, 1000)
      return
    }

    try {
      // Récupérer les variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Variables d'environnement Supabase manquantes")
      }

      // Utiliser notre fonction supabaseFetch qui gère les problèmes de connectivité
      const response = await supabaseFetch(`${supabaseUrl}/auth/v1/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email: registeredEmail,
          type: "signup",
          redirect_to: `${window.location.origin}/auth/callback`,
        }),
      })

      const data = await response.json()

      // Vérifier si c'est une erreur réseau simulée
      if (data.error === "network_error") {
        setNetworkError(data.error_description || data.message || "Problème de connexion au serveur")
        toast({
          title: "Problème de connexion",
          description: "Nous vous suggérons d'activer le mode hors ligne",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        toast({
          title: "Échec de l'envoi",
          description: data.error_description || data.error || "Une erreur est survenue lors de l'envoi de l'email",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Email envoyé",
          description: "Un nouvel email de vérification a été envoyé",
        })
      }
    } catch (error: any) {
      setNetworkError(error.message || "Une erreur réseau s'est produite")
      toast({
        title: "Échec de l'envoi",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un état de chargement jusqu'à ce que le composant soit monté côté client
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Chargement...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  // Si l'inscription est réussie, afficher un message de confirmation
  if (registrationSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{offlineMode ? "Compte créé" : "Vérifiez votre email"}</CardTitle>
          <CardDescription className="text-center">
            {offlineMode
              ? "Votre compte a été créé avec succès en mode hors ligne"
              : `Un email de vérification a été envoyé à ${registeredEmail}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {offlineMode ? (
            <Alert>
              <AlertTitle>Mode hors ligne activé</AlertTitle>
              <AlertDescription>
                Votre compte a été créé localement. Vous pouvez maintenant vous connecter.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>Vérification requise</AlertTitle>
                <AlertDescription>
                  Veuillez cliquer sur le lien dans l'email pour activer votre compte. Vérifiez également votre dossier
                  de spam si vous ne trouvez pas l'email.
                </AlertDescription>
              </Alert>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer
                  l'email.
                </p>
                <Button onClick={handleResendVerificationEmail} disabled={isLoading} variant="outline">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
                    </>
                  ) : (
                    "Renvoyer l'email de vérification"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setRegistrationSuccess(false)
              setActiveTab("signin")
            }}
            variant="secondary"
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {offlineMode ? "Mode Hors Ligne" : "Méthode alternative"}
          </CardTitle>
          <CardDescription className="text-center">
            {offlineMode
              ? "L'application fonctionne sans connexion internet"
              : "Utilisez cette méthode si l'authentification standard ne fonctionne pas"}
          </CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
        </CardHeader>

        {networkError && (
          <Alert variant="destructive" className="mx-6 mt-2">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Problème de connexion</AlertTitle>
            <AlertDescription>
              {networkError}
              <p className="mt-2 text-xs">Vérifiez votre connexion internet ou essayez à nouveau plus tard.</p>
            </AlertDescription>
          </Alert>
        )}

        {offlineMode && (
          <Alert variant="warning" className="mx-6 mt-2">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Mode hors ligne actif</AlertTitle>
            <AlertDescription>
              L'application fonctionne actuellement en mode hors ligne. Les données sont stockées localement.
            </AlertDescription>
          </Alert>
        )}

        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-direct">Email</Label>
                <Input
                  id="email-direct"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-direct">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password-direct"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours...
                  </>
                ) : (
                  `Se connecter ${offlineMode ? "(Mode hors ligne)" : "(Méthode alternative)"}`
                )}
              </Button>

              {debugInfo && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                  <p>Débogage: {debugInfo}</p>
                </div>
              )}
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup-direct">Email</Label>
                <Input
                  id="email-signup-direct"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup-direct">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password-signup-direct"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>
              {!offlineMode && (
                <Alert variant="info" className="mt-4">
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Vérification d'email requise</AlertTitle>
                  <AlertDescription>
                    Après l'inscription, vous recevrez un email de vérification. Vous devrez cliquer sur le lien dans
                    cet email pour activer votre compte.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du compte...
                  </>
                ) : (
                  `Créer un compte ${offlineMode ? "(Mode hors ligne)" : "(Méthode alternative)"}`
                )}
              </Button>

              {debugInfo && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                  <p>Débogage: {debugInfo}</p>
                </div>
              )}
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
