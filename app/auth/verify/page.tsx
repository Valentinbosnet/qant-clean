"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resendVerificationEmail } = useAuth()
  const { toast } = useToast()

  const handleResendVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await resendVerificationEmail(email)
      if (error) {
        toast({
          title: "Échec de l'envoi",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setEmailSent(true)
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

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Vérification d'email</CardTitle>
          <CardDescription className="text-center">
            Renvoyez un email de vérification pour activer votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailSent ? (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Email envoyé</AlertTitle>
              <AlertDescription>
                Un email de vérification a été envoyé à <strong>{email}</strong>. Veuillez vérifier votre boîte de
                réception et cliquer sur le lien pour activer votre compte.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResendVerificationEmail}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
                    </>
                  ) : (
                    "Envoyer l'email de vérification"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
