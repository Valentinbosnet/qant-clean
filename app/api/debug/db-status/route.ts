import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Get list of tables
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract table names
    const tables = data.map((table) => table.table_name)

    // Check for required tables
    const requiredTables = ["users", "verification_tokens", "email_logs"]
    const missingTables = requiredTables.filter((table) => !tables.includes(table))

    if (missingTables.length > 0) {
      return NextResponse.json({
        tables,
        missing: missingTables,
        message: `Tables manquantes: ${missingTables.join(", ")}`,
      })
    }

    return NextResponse.json({
      success: true,
      tables,
      message: "Toutes les tables requises sont présentes",
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification des tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
