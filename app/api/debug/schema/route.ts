import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer le schéma de la base de données
    const result = {
      tables: [],
      columns: {},
      error: null,
    }

    try {
      // Récupérer la liste des tables
      const tables = await db.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      result.tables = tables

      // Pour chaque table, récupérer ses colonnes
      for (const table of tables as any[]) {
        const tableName = table.table_name
        const columns = await db.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = ${tableName}
          ORDER BY ordinal_position
        `
        result.columns[tableName] = columns
      }
    } catch (dbError) {
      result.error = dbError instanceof Error ? dbError.message : "Erreur inconnue"
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors de la récupération du schéma:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
