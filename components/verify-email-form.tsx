"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle, Mail, ArrowRight } from "lucide-react"

interface VerifyEmailFormProps {
  email?: string
}

export default function VerifyEmailForm({ email: initialEmail }: VerifyEmailFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail || "")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [alreadyVerified, setAlreadyVerified] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Vérifier si l'email est déjà vérifié au chargement
  useEffect(() => {
    if (email) {
      checkEmailStatus(email)
    } else {
      setCheckingStatus(false)
    }
  }, [email])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const checkEmailStatus = async (emailToCheck: string) => {
    setCheckingStatus(true)
    try {
      const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(emailToCheck)}`)
      const data = await response.json()

      if (data.isVerified) {
        setAlreadyVerified(true)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut de l'email:", error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Utiliser la nouvelle route de vérification directe
      const response = await fetch("/api/auth/direct-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la vérification")
      }

      setSuccess(true)

      // Rediriger vers l'URL spécifiée dans la réponse
      setTimeout(() => {
        router.push(data.redirectUrl || "/subscription-required")
      }, 1500)
    } catch (error) {
      console.error("Erreur de vérification:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors de la vérification")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError(null)
    setResendSuccess(false)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du code")
      }

      if (data.alreadyVerified) {
        setAlreadyVerified(true)
        setTimeout(() => {
          router.push("/subscription-required")
        }, 2000)
      } else {
        setResendSuccess(true)
        setCountdown(60) // Désactiver le bouton pendant 60 secondes
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du code:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors de l'envoi du code")
    } finally {
      setResendLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-300">Vérification du statut de l'email...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">Vérification de l'email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alreadyVerified ? (
          <div className="bg-emerald-500/10 border border-emerald-500 rounded p-4 flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-emerald-400 mb-2" />
            <p className="text-emerald-300 mb-4">
              Votre email a déjà été vérifié. Vous allez être redirigé vers la page d'abonnement.
            </p>
            <Button
              onClick={() => router.push("/subscription-required")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continuer vers la page d'abonnement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : success ? (
          <div className="bg-emerald-500/10 border border-emerald-500 rounded p-4 flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-emerald-400 mb-2" />
            <p className="text-emerald-300">
              Votre email a été vérifié avec succès. Vous allez être redirigé vers la page d'abonnement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="bg-gray-700/50 border border-gray-600 rounded p-4 flex items-center">
              <Mail className="h-5 w-5 text-emerald-400 mr-3 shrink-0" />
              <p className="text-gray-300 text-sm">
                Un code de vérification a été envoyé à votre adresse email. Veuillez saisir ce code ci-dessous pour
                vérifier votre compte.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="bg-gray-700 border-gray-600 text-white"
                required
                disabled={!!initialEmail}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300">
                Code de vérification
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="bg-gray-700 border-gray-600 text-white text-center text-xl tracking-widest"
                required
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {resendSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500 rounded p-3 flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-emerald-300 text-sm">
                  Un nouveau code de vérification a été envoyé à votre adresse email.
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      {!success && !alreadyVerified && (
        <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950"
          >
            {resendLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : countdown > 0 ? (
              `Renvoyer le code (${countdown}s)`
            ) : (
              "Renvoyer le code"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
