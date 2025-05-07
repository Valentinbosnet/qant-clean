"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Schémas de validation
const emailSchema = z.string().email({ message: "Adresse email invalide" })
const passwordSchema = z
  .string()
  .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
  .max(100, { message: "Le mot de passe est trop long" })

interface AuthFormProps {
  defaultTab?: "signin" | "signup"
}

export function AuthForm({ defaultTab = "signin" }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [isClient, setIsClient] = useState(false)
  const { signIn, signUp, resendVerificationEmail } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

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

    if (!validateForm() || !isClient) return

    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setRegistrationSuccess(true)
          setRegisteredEmail(email)
          toast({
            title: "Email non vérifié",
            description: "Veuillez vérifier votre email avant de vous connecter",
            variant: "warning",
          })
        } else if (error.message.includes("Invalid login")) {
          toast({
            title: "Échec de connexion",
            description: "Email ou mot de passe incorrect",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Échec de connexion",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord !",
        })
        router.push("/")
      }
    } catch (error: any) {
      toast({
        title: "Échec de connexion",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !isClient) return

    setIsLoading(true)

    try {
      const { error, data } = await signUp(email, password)
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Inscription impossible",
            description: "Un compte existe déjà avec cette adresse email",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Échec de l'inscription",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        setRegistrationSuccess(true)
        setRegisteredEmail(email)
        toast({
          title: "Inscription réussie",
          description: "Un email de vérification a été envoyé à votre adresse email",
        })
      }
    } catch (error: any) {
      toast({
        title: "Échec de l'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerificationEmail = async () => {
    if (!registeredEmail || !isClient) return

    setIsLoading(true)
    try {
      const { error } = await resendVerificationEmail(registeredEmail)
      if (error) {
        toast({
          title: "Échec de l'envoi",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Email envoyé",
          description: "Un nouvel email de vérification a été envoyé",
        })
      }
    } catch (error: any) {
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
          <CardTitle className="text-2xl text-center">Vérifiez votre email</CardTitle>
          <CardDescription className="text-center">
            Un email de vérification a été envoyé à <strong>{registeredEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertTitle>Vérification requise</AlertTitle>
            <AlertDescription>
              Veuillez cliquer sur le lien dans l'email pour activer votre compte. Vérifiez également votre dossier de
              spam si vous ne trouvez pas l'email.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer l'email.
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
          <CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte ou créez-en un nouveau
          </CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
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
              <div className="text-sm text-right">
                <Link href="/auth/verify" className="text-primary hover:underline">
                  Renvoyer l'email de vérification
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
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
                <Label htmlFor="password-signup">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password-signup"
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
              <Alert variant="info" className="mt-4">
                <Mail className="h-4 w-4" />
                <AlertTitle>Vérification d'email requise</AlertTitle>
                <AlertDescription>
                  Après l'inscription, vous recevrez un email de vérification. Vous devrez cliquer sur le lien dans cet
                  email pour activer votre compte.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du compte...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
