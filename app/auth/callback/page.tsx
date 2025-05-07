"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Vérification de votre authentification...")
  const [errorDetails, setErrorDetails] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Créer un client Supabase directement ici au lieu d'utiliser getBrowserClient
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Variables d'environnement Supabase manquantes")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
        })

        // Récupérer le code de la requête
        const code = searchParams.get("code")
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          setStatus("error")
          setMessage("Erreur lors de l'authentification")
          setErrorDetails(errorDescription || "Une erreur inconnue s'est produite")
          return
        }

        if (code) {
          // Échanger le code contre une session
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            setStatus("error")
            setMessage("Erreur lors de l'authentification")
            setErrorDetails(error.message)
            return
          }

          // Vérification réussie
          setStatus("success")
          setMessage("Votre email a été vérifié avec succès !")

          // Rediriger vers la page d'accueil après une authentification réussie
          setTimeout(() => {
            router.push("/")
          }, 3000)
        } else {
          setStatus("error")
          setMessage("Aucun code d'authentification trouvé dans l'URL")
          setErrorDetails("Le lien de vérification est invalide ou a expiré")
        }
      } catch (err: any) {
        console.error("Erreur lors du traitement du callback:", err)
        setStatus("error")
        setMessage("Une erreur est survenue lors de l'authentification")
        setErrorDetails(err.message || "Détails non disponibles")
      }
    }

    // S'assurer que ce code ne s'exécute que côté client
    if (typeof window !== "undefined") {
      handleCallback()
    }
  }, [searchParams, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold text-center">{message}</h1>
            <p className="text-center text-muted-foreground">
              Veuillez patienter pendant que nous vérifions votre email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h1 className="text-2xl font-semibold text-center">{message}</h1>
            <p className="text-center text-muted-foreground">
              Vous êtes maintenant connecté. Vous allez être redirigé vers la page d'accueil...
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Aller à la page d'accueil</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="text-2xl font-semibold text-center">{message}</h1>
            <p className="text-center text-destructive">{errorDetails}</p>
            <div className="flex flex-col space-y-2 w-full mt-4">
              <Button asChild variant="outline">
                <Link href="/auth">Retour à la page de connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/">Aller à la page d'accueil</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
