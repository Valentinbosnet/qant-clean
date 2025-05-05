import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Variables d'environnement Supabase manquantes" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer la structure de la table auth.users
    const { data: authColumns, error: authError } = await supabase.rpc("inspect_auth_schema").catch(() => {
      return { data: null, error: { message: "Fonction inspect_auth_schema non disponible" } }
    })

    // Essayer une autre approche si la première échoue
    let authStructure = null
    let authStructureError = null

    if (authError) {
      try {
        // Exécuter une requête SQL directe pour obtenir la structure
        const { data, error } = await supabase.from("auth_schema_info").select("*").limit(1)
        authStructure = data
        authStructureError = error
      } catch (err) {
        authStructureError = err
      }
    }

    // Créer une fonction SQL pour inspecter le schéma
    const createInspectFunction = `
    CREATE OR REPLACE FUNCTION public.inspect_auth_schema()
    RETURNS TABLE (
      table_name text,
      column_name text,
      data_type text
    ) 
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
      SELECT 
        table_name::text,
        column_name::text,
        data_type::text
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'auth'
      ORDER BY 
        table_name, ordinal_position;
    $$;
    `

    // Créer une table pour stocker les informations du schéma
    const createSchemaInfoTable = `
    CREATE TABLE IF NOT EXISTS public.auth_schema_info (
      id SERIAL PRIMARY KEY,
      table_name TEXT,
      column_name TEXT,
      data_type TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `

    // Insérer les données du schéma dans la table
    const populateSchemaInfo = `
    INSERT INTO public.auth_schema_info (table_name, column_name, data_type)
    SELECT 
      table_name,
      column_name,
      data_type
    FROM 
      information_schema.columns
    WHERE 
      table_schema = 'auth'
    ON CONFLICT DO NOTHING;
    `

    return NextResponse.json({
      authColumns: authError ? { error: authError.message } : authColumns,
      authStructure: authStructureError ? { error: authStructureError.message } : authStructure,
      sqlToExecute: {
        createInspectFunction,
        createSchemaInfoTable,
        populateSchemaInfo,
      },
      simpleTables: `
-- Création d'une table simple pour les utilisateurs
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'une table simple pour les tokens de vérification
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'une table simple pour les logs d'email
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error TEXT
);

-- Création des index
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
`,
    })
  } catch (error: any) {
    console.error("Erreur lors de l'inspection du schéma:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'inspection du schéma" }, { status: 500 })
  }
}
