import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Utiliser params.id de manière sûre en vérifiant d'abord qu'il existe
    const portfolioId = params?.id

    if (!portfolioId) {
      return NextResponse.json({ error: "ID de portfolio manquant" }, { status: 400 })
    }

    // Essayer de récupérer le portfolio avec une requête SQL brute
    try {
      // Vérifier d'abord si la table Portfolio existe
      const tables = await db.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'Portfolio'
      `

      if (Array.isArray(tables) && tables.length > 0) {
        // Vérifier les colonnes disponibles
        const columns = await db.$queryRaw`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'Portfolio'
        `

        const columnNames = (columns as any[]).map((col) => col.column_name)
        console.log("Colonnes disponibles dans Portfolio:", columnNames)

        // Construire la requête en fonction des colonnes disponibles
        const portfolios = await db.$queryRaw`
          SELECT * FROM "Portfolio"
          WHERE "id" = ${portfolioId} AND "userId" = ${session.user.id}
        `

        if (Array.isArray(portfolios) && portfolios.length > 0) {
          // Ajouter des valeurs par défaut pour balance et currency
          const portfolio = {
            ...portfolios[0],
            balance: portfolios[0].balance ?? 10000,
            currency: portfolios[0].currency ?? "EUR",
          }
          console.log("Portfolio trouvé avec valeurs par défaut:", portfolio)
          return NextResponse.json(portfolio)
        } else {
          return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
        }
      }

      // Si la table Portfolio n'existe pas, essayer avec la table "portfolio" (minuscule)
      const tablesLowercase = await db.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'portfolio'
      `

      if (Array.isArray(tablesLowercase) && tablesLowercase.length > 0) {
        // Vérifier les colonnes disponibles
        const columns = await db.$queryRaw`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'portfolio'
        `

        const columnNames = (columns as any[]).map((col) => col.column_name)
        console.log("Colonnes disponibles dans portfolio:", columnNames)

        // Construire la requête en fonction des colonnes disponibles
        const portfolios = await db.$queryRaw`
          SELECT * FROM "portfolio"
          WHERE "id" = ${portfolioId} AND "userId" = ${session.user.id}
        `

        if (Array.isArray(portfolios) && portfolios.length > 0) {
          // Ajouter des valeurs par défaut pour balance et currency
          const portfolio = {
            ...portfolios[0],
            balance: portfolios[0].balance ?? 10000,
            currency: portfolios[0].currency ?? "EUR",
          }
          console.log("Portfolio trouvé avec valeurs par défaut:", portfolio)
          return NextResponse.json(portfolio)
        } else {
          return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
        }
      }

      // Si aucune table de portfolio n'existe, retourner une erreur
      return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
    } catch (sqlError) {
      console.error("Erreur SQL lors de la récupération du portfolio:", sqlError)

      // Essayer avec Prisma comme solution de secours
      try {
        // Vérifier si le modèle Portfolio existe dans Prisma
        if (typeof db.portfolio === "object") {
          const portfolio = await db.portfolio.findFirst({
            where: {
              id: portfolioId,
              userId: session.user.id,
            },
          })

          if (portfolio) {
            // Ajouter des valeurs par défaut pour balance et currency
            const portfolioWithDefaults = {
              ...portfolio,
              balance: portfolio.balance ?? 10000,
              currency: portfolio.currency ?? "EUR",
            }
            console.log("Portfolio trouvé avec valeurs par défaut (Prisma):", portfolioWithDefaults)
            return NextResponse.json(portfolioWithDefaults)
          } else {
            return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
          }
        }

        // Retourner une erreur si aucun modèle n'est disponible
        return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
      } catch (prismaError) {
        console.error("Erreur Prisma lors de la récupération du portfolio:", prismaError)
        return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du portfolio:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
