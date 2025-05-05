"use server"

import { createClient } from "@supabase/supabase-js"
import { generateVerificationEmailHtml } from "./email-utils"

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Configuration Mailjet
const mailjetApiKey = process.env.MAILJET_API_KEY
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY
const mailjetSender = process.env.MAILJET_SENDER

// Initialiser le client Supabase
const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuration Supabase manquante")
  }
  return createClient(supabaseUrl, supabaseKey)
}

// Fonction pour envoyer un email avec Mailjet
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  userId?: string
}): Promise<{
  success: boolean
  messageId?: string
  error?: any
}> {
  try {
    if (!mailjetApiKey || !mailjetSecretKey || !mailjetSender) {
      console.error("Configuration Mailjet manquante:", {
        apiKey: !!mailjetApiKey,
        secretKey: !!mailjetSecretKey,
        sender: !!mailjetSender,
      })
      throw new Error("Configuration Mailjet manquante")
    }

    console.log("Tentative d'envoi d'email via Mailjet:", {
      to: options.to,
      subject: options.subject,
      sender: mailjetSender,
    })

    // Utiliser l'API Mailjet directement avec fetch
    try {
      const response = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString("base64")}`,
        },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: mailjetSender,
                Name: "TradeAssist",
              },
              To: [
                {
                  Email: options.to,
                  Name: options.to.split("@")[0],
                },
              ],
              Subject: options.subject,
              HTMLPart: options.html,
            },
          ],
        }),
      })

      console.log("Réponse de l'API Mailjet:", {
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erreur Mailjet détaillée:", errorData)
        throw new Error(`Erreur Mailjet: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log("Données de réponse Mailjet:", data)
      const messageId = data.Messages?.[0]?.To?.[0]?.MessageID || "unknown"

      // Enregistrer le log d'email
      try {
        const supabase = getSupabase()
        await supabase.from("email_logs").insert({
          user_id: options.userId || null,
          email: options.to,
          subject: options.subject,
          content: options.html,
          status: "sent",
        })
      } catch (logError) {
        console.error("Erreur lors de l'enregistrement du log d'email:", logError)
        // Ne pas échouer si l'enregistrement du log échoue
      }

      return { success: true, messageId }
    } catch (fetchError) {
      console.error("Erreur lors de la requête fetch vers Mailjet:", fetchError)
      throw fetchError
    }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email:", error)

    // Enregistrer l'erreur dans les logs
    try {
      const supabase = getSupabase()
      await supabase.from("email_logs").insert({
        user_id: options.userId || null,
        email: options.to,
        subject: options.subject,
        content: options.html,
        status: "error",
        error: error.message,
      })
    } catch (logError) {
      console.error("Erreur lors de l'enregistrement du log d'erreur d'email:", logError)
    }

    return { success: false, error: error.message }
  }
}

// Fonction pour générer un code de vérification
export async function generateVerificationCode(): Promise<string> {
  // Générer un code à 6 chiffres
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Fonction pour enregistrer un code de vérification
export async function saveVerificationCode(
  email: string,
  code: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log("Tentative d'enregistrement du code de vérification:", { email, code })
    const supabase = getSupabase()

    // Supprimer les anciens codes pour cet email
    const { error: deleteError } = await supabase.from("verification_codes").delete().eq("user_email", email)
    if (deleteError) {
      console.warn("Erreur lors de la suppression des anciens codes:", deleteError)
      // Continuer malgré l'erreur
    }

    // Ajouter le nouveau code
    const { error } = await supabase.from("verification_codes").insert({
      user_email: email,
      code: code,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 heures
    })

    if (error) {
      console.error("Erreur lors de l'insertion du code de vérification:", error)
      throw error
    }

    console.log("Code de vérification enregistré avec succès")
    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement du code de vérification:", error)
    return { success: false, error: error.message }
  }
}

// Fonction pour envoyer un email de vérification
export async function sendVerificationEmail(
  email: string,
  code: string,
  userId?: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log("Tentative d'envoi d'email de vérification:", { email, code })
    const name = email.split("@")[0] // Utiliser la partie avant @ comme nom par défaut
    const html = generateVerificationEmailHtml(name, code)
    const subject = "Vérification de votre adresse email"

    const result = await sendEmail({
      to: email,
      subject,
      html,
      userId,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    console.log("Email de vérification envoyé avec succès")
    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de vérification:", error)
    return { success: false, error: error.message }
  }
}

// Fonction pour vérifier si un email est déjà vérifié
export async function checkEmailVerificationStatus(email: string): Promise<{
  isVerified: boolean
  error?: string
}> {
  try {
    console.log("Vérification du statut de l'email:", email)
    const supabase = getSupabase()

    // Vérifier dans la table app_users si l'email est déjà vérifié
    const { data, error } = await supabase.from("app_users").select("email_verified").eq("email", email).single()

    if (error) {
      console.error("Erreur lors de la vérification du statut de l'email:", error)
      throw error
    }

    console.log("Statut de vérification de l'email:", { email, isVerified: data?.email_verified === true })
    return { isVerified: data?.email_verified === true }
  } catch (error: any) {
    console.error("Erreur lors de la vérification du statut de l'email:", error)
    return { isVerified: false, error: error.message }
  }
}

// Fonction pour vérifier un code
export async function verifyCode(
  email: string,
  code: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log("Tentative de vérification du code:", { email, code })
    const supabase = getSupabase()

    // Vérifier d'abord si l'email est déjà vérifié
    const { isVerified } = await checkEmailVerificationStatus(email)
    if (isVerified) {
      console.log("Email déjà vérifié:", email)
      return { success: true, error: "Email déjà vérifié" }
    }

    // Vérifier si le code existe et n'est pas expiré
    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("user_email", email)
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      console.error("Code invalide ou expiré:", { error, data })
      return { success: false, error: "Code invalide ou expiré" }
    }

    console.log("Code valide, mise à jour du statut de vérification")
    // Marquer l'utilisateur comme vérifié
    const { error: updateError } = await supabase.from("app_users").update({ email_verified: true }).eq("email", email)

    if (updateError) {
      console.error("Erreur lors de la mise à jour du statut de vérification:", updateError)
      return { success: false, error: "Erreur lors de la mise à jour du statut de vérification" }
    }

    // Supprimer le code utilisé
    const { error: deleteError } = await supabase
      .from("verification_codes")
      .delete()
      .eq("user_email", email)
      .eq("code", code)

    if (deleteError) {
      console.warn("Erreur lors de la suppression du code utilisé:", deleteError)
      // Ne pas échouer si la suppression échoue
    }

    console.log("Email vérifié avec succès:", email)
    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors de la vérification du code:", error)
    return { success: false, error: error.message }
  }
}

// Fonction pour générer et envoyer un code de vérification
export async function generateAndSendVerificationCode(
  email: string,
  userId?: string,
): Promise<{
  success: boolean
  code?: string
  error?: string
}> {
  try {
    console.log("Tentative de génération et d'envoi de code de vérification:", email)
    // Vérifier d'abord si l'email est déjà vérifié
    const { isVerified } = await checkEmailVerificationStatus(email)
    if (isVerified) {
      console.log("Email déjà vérifié, pas besoin d'envoyer un code:", email)
      return { success: true, error: "Email déjà vérifié" }
    }

    // Générer un code de vérification
    const code = await generateVerificationCode()
    console.log("Code de vérification généré:", { email, code })

    // Enregistrer le code
    const saveResult = await saveVerificationCode(email, code)
    if (!saveResult.success) {
      console.error("Erreur lors de l'enregistrement du code:", saveResult.error)
      throw new Error(saveResult.error)
    }

    // Envoyer l'email
    const sendResult = await sendVerificationEmail(email, code, userId)
    if (!sendResult.success) {
      console.error("Erreur lors de l'envoi de l'email:", sendResult.error)
      throw new Error(sendResult.error)
    }

    console.log("Code de vérification généré et envoyé avec succès")
    return { success: true, code }
  } catch (error: any) {
    console.error("Erreur lors de la génération et de l'envoi du code:", error)
    return { success: false, error: error.message }
  }
}

export { generateVerificationEmailHtml }
