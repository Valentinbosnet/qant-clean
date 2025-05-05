import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  console.log("🔍 Début de la vérification directe d'email")

  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      console.log("❌ Email ou code manquant")
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    console.log(`📧 Tentative de vérification pour: ${email} avec code: ${code}`)

    // Vérifier si l'email est déjà vérifié
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier si l'email est déjà vérifié
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("email_verified")
      .eq("email", email)
      .single()

    if (!userError && userData && userData.email_verified) {
      console.log(`✅ Email déjà vérifié pour: ${email}`)

      // Connecter l'utilisateur et rediriger
      const loginResponse = await fetch(`${req.nextUrl.origin}/api/auth/login-after-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          redirectUrl: loginData.redirectUrl || "/subscription-required",
        })
      } else {
        console.error("❌ Erreur lors de la connexion après vérification")
        return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
      }
    }

    // Vérifier le code
    const { data: verificationData, error: verificationError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("user_email", email)
      .eq("code", code)
      .single()

    if (verificationError || !verificationData) {
      console.log("❌ Code invalide ou expiré")
      return NextResponse.json({ error: "Code de vérification invalide ou expiré" }, { status: 400 })
    }

    // Marquer l'email comme vérifié
    const { error: updateError } = await supabase
      .from("app_users")
      .update({ email_verified: new Date().toISOString() })
      .eq("email", email)

    if (updateError) {
      console.error("❌ Erreur lors de la mise à jour du statut de vérification:", updateError)
      return NextResponse.json({ error: "Erreur lors de la mise à jour du statut de vérification" }, { status: 500 })
    }

    console.log(`✅ Email vérifié pour: ${email}`)

    // Supprimer les codes de vérification
    await supabase.from("verification_codes").delete().eq("user_email", email)

    console.log("✅ Codes de vérification supprimés")

    // Mettre à jour le statut dans Supabase Auth
    const { data: authUserData, error: authUserError } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", email)
      .single()

    if (!authUserError && authUserData) {
      await supabase.auth.admin.updateUserById(authUserData.id, {
        email_confirm: true,
      })
      console.log("✅ Statut de confirmation d'email mis à jour dans Supabase Auth")
    } else {
      console.log("⚠️ Impossible de mettre à jour le statut dans Supabase Auth:", authUserError)
    }

    // Connecter l'utilisateur et rediriger
    const loginResponse = await fetch(`${req.nextUrl.origin}/api/auth/login-after-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      return NextResponse.json({
        success: true,
        redirectUrl: loginData.redirectUrl || "/subscription-required",
      })
    } else {
      console.error("❌ Erreur lors de la connexion après vérification")
      return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Erreur serveur:", error)
    return NextResponse.json({ error: "Erreur serveur lors de la vérification de l'email" }, { status: 500 })
  }
}
