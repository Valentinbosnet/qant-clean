import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est administrateur
    if (session.user.role !== "ADMIN" && session.user.email !== "test@example.com") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Vérifier si la table Portfolio existe
    const portfolioTableExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Portfolio'
      );
    `

    const tableExists = (portfolioTableExists as any)[0]?.exists || false

    if (!tableExists) {
      // Créer la table Portfolio si elle n'existe pas
      await db.$executeRaw`
        CREATE TABLE "Portfolio" (
          "id" UUID PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "balance" DECIMAL(15,2) DEFAULT 10000,
          "currency" TEXT DEFAULT 'EUR',
          "isDefault" BOOLEAN DEFAULT false,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `

      return NextResponse.json({
        success: true,
        message: "Table Portfolio créée avec succès",
      })
    }

    // Vérifier les colonnes existantes
    const columns = await db.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Portfolio'
    `

    const columnNames = (columns as any[]).map((col) => col.column_name)

    // Ajouter les colonnes manquantes
    const alterTableQueries = []

    if (!columnNames.includes("balance")) {
      alterTableQueries.push(db.$executeRaw`
        ALTER TABLE "Portfolio" ADD COLUMN "balance" DECIMAL(15,2) DEFAULT 10000
      `)
    }

    if (!columnNames.includes("currency")) {
      alterTableQueries.push(db.$executeRaw`
        ALTER TABLE "Portfolio" ADD COLUMN "currency" TEXT DEFAULT 'EUR'
      `)
    }

    if (!columnNames.includes("isDefault")) {
      alterTableQueries.push(db.$executeRaw`
        ALTER TABLE "Portfolio" ADD COLUMN "isDefault" BOOLEAN DEFAULT false
      `)
    }

    // Exécuter les requêtes d'altération de table
    if (alterTableQueries.length > 0) {
      await Promise.all(alterTableQueries)
      return NextResponse.json({
        success: true,
        message: "Colonnes ajoutées avec succès",
        addedColumns: alterTableQueries.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Le schéma est déjà à jour",
      columns: columnNames,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du schéma:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour du schéma",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
