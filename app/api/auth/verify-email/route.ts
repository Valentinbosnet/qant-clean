import { type NextRequest, NextResponse } from "next/server"
import { verifyCode, checkEmailVerificationStatus } from "@/lib/email-service"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    console.log("Requête de vérification d'email reçue")
    const { email, code } = await req.json()
    console.log("Données de vérification:", { email, code })

    if (!email || !code) {
      console.error("Email ou code manquant")
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    // Vérifier d'abord si l'email est déjà vérifié
    console.log("Vérification du statut de l'email")
    const verificationStatus = await checkEmailVerificationStatus(email)
    console.log("Statut de vérification:", verificationStatus)

    if (verificationStatus.isVerified) {
      console.log("Email déjà vérifié, redirection vers la page d'abonnement")
      return NextResponse.json({
        success: true,
        message: "Email déjà vérifié",
        alreadyVerified: true,
        redirectUrl: "/subscription-required", // Rediriger vers la page d'abonnement si déjà vérifié
      })
    }

    // Si l'email n'est pas encore vérifié, vérifier le code
    console.log("Vérification du code")
    const result = await verifyCode(email, code)
    console.log("Résultat de la vérification:", result)

    if (!result.success) {
      console.error("Échec de la vérification:", result.error)
      return NextResponse.json({ error: result.error || "Code invalide" }, { status: 400 })
    }

    // Mettre à jour le statut dans Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })

        // Récupérer l'ID de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from("app_users")
          .select("id")
          .eq("email", email)
          .single()

        if (userError) {
          console.error("Erreur lors de la récupération de l'ID utilisateur:", userError)
          // Continuer même en cas d'erreur, car l'email a été vérifié avec succès
        } else if (userData) {
          // Mettre à jour le statut de confirmation d'email dans Supabase Auth
          await supabase.auth.admin.updateUserById(userData.id, {
            email_confirm: true,
          })
          console.log(`Statut de confirmation d'email mis à jour dans Supabase Auth pour ${email}`)
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut dans Supabase Auth:", error)
        // Continuer même en cas d'erreur, car l'email a été vérifié avec succès
      }
    }

    console.log("Email vérifié avec succès, redirection vers la page d'abonnement")
    return NextResponse.json({
      success: true,
      message: "Email vérifié avec succès",
      redirectUrl: "/subscription-required", // Rediriger vers la page d'abonnement après vérification
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification de l'email:", error)
    return NextResponse.json({ error: error.message || "Une erreur s'est produite" }, { status: 500 })
  }
}

// Endpoint pour vérifier le statut de vérification d'un email
export async function GET(req: NextRequest) {
  try {
    console.log("Requête GET pour vérifier le statut d'un email")
    const url = new URL(req.url)
    const email = url.searchParams.get("email")
    console.log("Email à vérifier:", email)

    if (!email) {
      console.error("Email manquant dans les paramètres")
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const status = await checkEmailVerificationStatus(email)
    console.log("Statut de vérification récupéré:", status)
    return NextResponse.json(status)
  } catch (error: any) {
    console.error("Erreur lors de la vérification du statut de l'email:", error)
    return NextResponse.json({ error: error.message || "Une erreur s'est produite" }, { status: 500 })
  }
}
