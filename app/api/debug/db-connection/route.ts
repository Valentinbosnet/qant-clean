import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Tester la connexion à la base de données
    const result = {
      connection: false,
      tables: [],
      models: [],
      error: null,
      rawQuery: null,
      prismaVersion: null,
      databaseUrl: process.env.DATABASE_URL ? "Configuré" : "Non configuré",
    }

    try {
      // Vérifier la version de Prisma
      result.prismaVersion = PrismaClient.prismaVersion

      // Tester la connexion avec une requête simple
      await db.$queryRaw`SELECT 1 as test`
      result.connection = true

      // Récupérer la liste des tables dans la base de données
      const tables = await db.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      result.tables = tables

      // Récupérer les modèles disponibles dans Prisma
      result.models = Object.keys(db).filter(
        (key) => !key.startsWith("_") && typeof db[key] === "object" && key !== "$connect" && key !== "$disconnect",
      )

      // Tester une requête brute pour créer un portfolio
      try {
        const rawResult = await db.$queryRaw`
          INSERT INTO "Portfolio" ("id", "name", "balance", "currency", "isDefault", "createdAt", "updatedAt", "userId")
          VALUES (
            gen_random_uuid(), 
            'Test Portfolio', 
            10000, 
            'EUR', 
            false, 
            NOW(), 
            NOW(), 
            ${session.user.id}
          )
          RETURNING "id"
        `
        result.rawQuery = { success: true, result: rawResult }
      } catch (rawError) {
        // Essayer avec "Portfolios" si "Portfolio" échoue
        try {
          const rawResult = await db.$queryRaw`
            INSERT INTO "Portfolios" ("id", "name", "balance", "currency", "isDefault", "createdAt", "updatedAt", "userId")
            VALUES (
              gen_random_uuid(), 
              'Test Portfolio', 
              10000, 
              'EUR', 
              false, 
              NOW(), 
              NOW(), 
              ${session.user.id}
            )
            RETURNING "id"
          `
          result.rawQuery = { success: true, result: rawResult }
        } catch (rawError2) {
          result.rawQuery = {
            success: false,
            error: rawError instanceof Error ? rawError.message : "Erreur inconnue",
            secondError: rawError2 instanceof Error ? rawError2.message : "Erreur inconnue",
          }
        }
      }
    } catch (dbError) {
      result.error = dbError instanceof Error ? dbError.message : "Erreur inconnue"
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors du test de connexion à la base de données:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
