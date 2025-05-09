"use client"

import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Loader2, Mail, AlertTriangle } from "lucide-react"
import { getClientSupabase } from "@/lib/client-supabase"

export function EmailVerificationStatus() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Si nous ne sommes pas côté client, ou si l'utilisateur n'est pas connecté,
  // ou si l'email est déjà vérifié, ne rien afficher
  if (!isClient || !user || user.email_confirmed_at) {
    return null
  }

  const handleResendVerification = async () => {
    if (!user.email) return

    setIsLoading(true)
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        throw new Error("Client Supabase non disponible")
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: "Échec de l'envoi",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Email envoyé",
          description: "Un nouvel email de vérification a été envoyé à votre adresse email",
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
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Email non vérifié</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Votre adresse email n'a pas encore été vérifiée. Certaines fonctionnalités peuvent être limitées jusqu'à ce
          que vous vérifiiez votre email.
        </p>
        <Button onClick={handleResendVerification} variant="outline" size="sm" className="w-fit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" /> Renvoyer l'email de vérification
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
