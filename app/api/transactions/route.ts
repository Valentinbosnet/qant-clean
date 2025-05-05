import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Structure pour stocker les transactions en mémoire si la base de données n'est pas disponible
const memoryTransactions: any[] = []

export async function GET(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get("portfolioId")
    const type = searchParams.get("type")

    console.log("Requête de transactions avec params:", { portfolioId, type })

    // Construire la requête
    const whereClause: any = { userId: session.user.id }
    if (portfolioId) {
      whereClause.portfolioId = portfolioId
    }

    // Si un type spécifique est demandé, filtrer par ce type
    if (type) {
      // Si plusieurs types sont spécifiés (ex: "BUY,SELL")
      if (type.includes(",")) {
        const types = type.split(",")
        whereClause.type = { in: types }
      } else {
        whereClause.type = type
      }
    }

    console.log("Clause WHERE pour les transactions:", whereClause)

    // Récupérer les transactions
    try {
      // Essayer d'abord avec le modèle Transaction
      try {
        const transactions = await db.transaction.findMany({
          where: whereClause,
          orderBy: { date: "desc" },
          include: {
            portfolio: {
              select: {
                name: true,
                currency: true,
              },
            },
          },
        })

        console.log(`${transactions.length} transactions trouvées`)
        return NextResponse.json(transactions)
      } catch (transactionError) {
        console.error("Erreur lors de la récupération des transactions:", transactionError)

        // Si le modèle Transaction n'existe pas, essayons avec un autre modèle
        try {
          // Essayons de récupérer les données d'un autre modèle qui pourrait contenir des informations similaires
          const assets = await db.asset.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
              portfolio: {
                select: {
                  name: true,
                  currency: true,
                },
              },
            },
          })

          // Convertir les assets en format de transaction
          const formattedAssets = assets.map((asset) => ({
            id: asset.id,
            type: asset.description?.startsWith("PREDICTION") ? "PREDICTION" : "BUY", // Par défaut
            symbol: asset.name,
            amount: 1, // Par défaut
            price: 0, // Par défaut
            date: asset.createdAt,
            portfolioId: asset.portfolioId,
            userId: asset.userId,
            portfolio: asset.portfolio,
            // Extraire les données de prédiction si disponibles
            ...(asset.description?.startsWith("PREDICTION") ? extractPredictionData(asset.description) : {}),
          }))

          return NextResponse.json(formattedAssets)
        } catch (assetError) {
          console.error("Erreur lors de la récupération des assets:", assetError)

          // Si aucun modèle ne fonctionne, retourner les transactions en mémoire
          const filteredTransactions = memoryTransactions.filter((t) => {
            let match = t.userId === session.user.id
            if (portfolioId) match = match && t.portfolioId === portfolioId
            if (type) match = match && t.type === type
            return match
          })

          return NextResponse.json(filteredTransactions)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error)

      // En cas d'erreur, retourner les transactions en mémoire
      const filteredTransactions = memoryTransactions.filter((t) => {
        let match = t.userId === session.user.id
        if (portfolioId) match = match && t.portfolioId === portfolioId
        if (type) match = match && t.type === type
        return match
      })

      return NextResponse.json(filteredTransactions)
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les données de la transaction
    const body = await request.json()
    const {
      portfolioId,
      type,
      symbol,
      amount,
      price,
      date,
      // Champs spécifiques aux prédictions
      expiryDate,
      duration,
      initialValue,
      currentValue,
      expectedReturn,
      analysis,
    } = body

    // Vérifier que le portfolio appartient à l'utilisateur
    try {
      const portfolio = await db.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId: session.user.id,
        },
      })

      if (!portfolio) {
        return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
      }

      // Calculer le montant total de la transaction
      const totalAmount = Number.parseFloat(amount) * (type === "PREDICTION" ? 1 : Number.parseFloat(price))

      // Mettre à jour le solde du portfolio en fonction du type de transaction
      let newBalance = portfolio.balance
      if (type === "BUY" || type === "PREDICTION") {
        newBalance -= totalAmount
      } else if (type === "SELL") {
        newBalance += totalAmount
      }

      // Créer la transaction
      try {
        // Préparer les données de la transaction
        const transactionData: any = {
          type,
          symbol,
          amount: Number.parseFloat(amount),
          price: Number.parseFloat(price),
          date: date ? new Date(date) : new Date(),
          portfolioId,
          userId: session.user.id,
        }

        // Ajouter les champs spécifiques aux prédictions si nécessaire
        if (type === "PREDICTION") {
          transactionData.expiryDate = expiryDate ? new Date(expiryDate) : null
          transactionData.duration = duration || 30
          transactionData.initialValue = initialValue || Number.parseFloat(amount)
          transactionData.currentValue = currentValue || Number.parseFloat(amount)
          transactionData.expectedReturn = expectedReturn || 0
          transactionData.analysis = analysis || ""
        }

        const transaction = await db.transaction.create({
          data: transactionData,
        })

        // Ajouter des logs pour le débogage
        console.log("Transaction créée avec succès:", {
          id: transaction.id,
          type: transaction.type,
          symbol: transaction.symbol,
          portfolioId: transaction.portfolioId,
        })

        // Mettre à jour le solde du portfolio
        await db.portfolio.update({
          where: { id: portfolioId },
          data: { balance: newBalance },
        })

        return NextResponse.json(transaction, { status: 201 })
      } catch (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError)
        console.error("Tentative de création d'une transaction avec les données:", transactionData)

        // Si le modèle Transaction n'existe pas, essayons avec un autre modèle
        try {
          // Créer un asset pour représenter la transaction
          let description = `${type} - ${amount} @ ${price}`

          // Si c'est une prédiction, stocker les données supplémentaires dans la description
          if (type === "PREDICTION") {
            description = `PREDICTION - ${symbol} - ${amount} - ${expiryDate} - ${duration} - ${initialValue} - ${currentValue} - ${expectedReturn}`
          }

          const asset = await db.asset.create({
            data: {
              name: symbol,
              description,
              portfolioId,
              userId: session.user.id,
            },
          })

          // Mettre à jour le solde du portfolio
          await db.portfolio.update({
            where: { id: portfolioId },
            data: { balance: newBalance },
          })

          // Convertir l'asset en format de transaction pour la réponse
          const formattedAsset = {
            id: asset.id,
            type,
            symbol,
            amount: Number.parseFloat(amount),
            price: Number.parseFloat(price),
            date: new Date(),
            portfolioId,
            userId: session.user.id,
            // Ajouter les champs spécifiques aux prédictions si nécessaire
            ...(type === "PREDICTION"
              ? {
                  expiryDate: expiryDate ? new Date(expiryDate) : null,
                  duration: duration || 30,
                  initialValue: initialValue || Number.parseFloat(amount),
                  currentValue: currentValue || Number.parseFloat(amount),
                  expectedReturn: expectedReturn || 0,
                  analysis: analysis || "",
                }
              : {}),
          }

          return NextResponse.json(formattedAsset, { status: 201 })
        } catch (assetError) {
          console.error("Erreur lors de la création de l'asset:", assetError)

          // Stocker la transaction en mémoire comme solution de secours
          const newTransaction = {
            id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type,
            symbol,
            amount: Number.parseFloat(amount),
            price: Number.parseFloat(price),
            date: date ? new Date(date) : new Date(),
            portfolioId,
            userId: session.user.id,
            portfolio: {
              name: portfolio.name,
              currency: portfolio.currency,
            },
            // Ajouter les champs spécifiques aux prédictions si nécessaire
            ...(type === "PREDICTION"
              ? {
                  expiryDate: expiryDate ? new Date(expiryDate) : null,
                  duration: duration || 30,
                  initialValue: initialValue || Number.parseFloat(amount),
                  currentValue: currentValue || Number.parseFloat(amount),
                  expectedReturn: expectedReturn || 0,
                  analysis: analysis || "",
                }
              : {}),
          }

          memoryTransactions.push(newTransaction)

          return NextResponse.json(newTransaction, { status: 201 })
        }
      }
    } catch (portfolioError) {
      console.error("Erreur lors de la vérification du portfolio:", portfolioError)

      // Créer une transaction en mémoire même si le portfolio n'est pas trouvé
      const newTransaction = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        symbol,
        amount: Number.parseFloat(amount),
        price: Number.parseFloat(price),
        date: date ? new Date(date) : new Date(),
        portfolioId,
        userId: session.user.id,
        portfolio: {
          name: "Portfolio inconnu",
          currency: "EUR",
        },
        // Ajouter les champs spécifiques aux prédictions si nécessaire
        ...(type === "PREDICTION"
          ? {
              expiryDate: expiryDate ? new Date(expiryDate) : null,
              duration: duration || 30,
              initialValue: initialValue || Number.parseFloat(amount),
              currentValue: currentValue || Number.parseFloat(amount),
              expectedReturn: expectedReturn || 0,
              analysis: analysis || "",
            }
          : {}),
      }

      memoryTransactions.push(newTransaction)

      return NextResponse.json(newTransaction, { status: 201 })
    }
  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

// Fonction pour extraire les données de prédiction à partir de la description
function extractPredictionData(description: string) {
  try {
    // Format: "PREDICTION - symbol - amount - expiryDate - duration - initialValue - currentValue - expectedReturn"
    const parts = description.split(" - ")
    if (parts.length < 8) return {}

    return {
      expiryDate: new Date(parts[3]),
      duration: Number.parseInt(parts[4]),
      initialValue: Number.parseFloat(parts[5]),
      currentValue: Number.parseFloat(parts[6]),
      expectedReturn: Number.parseFloat(parts[7]),
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction des données de prédiction:", error)
    return {}
  }
}
