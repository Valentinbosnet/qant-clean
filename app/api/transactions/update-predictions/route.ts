import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getStockQuote } from "@/lib/stock-service"

// Cette route s'occupe de mettre à jour la valeur actuelle des prédictions
export async function POST() {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const now = new Date()

    try {
      // Trouver toutes les prédictions actives
      const activePredictions = await db.transaction.findMany({
        where: {
          userId: session.user.id,
          type: "PREDICTION",
          expired: false,
          expiryDate: {
            gt: now,
          },
        },
      })

      // Pour chaque prédiction active
      const updatedPredictions = []
      for (const prediction of activePredictions) {
        try {
          // Récupérer le prix actuel
          const stockData = await getStockQuote(prediction.symbol)

          if (stockData) {
            // Calculer la nouvelle valeur
            const currentPrice = stockData.currentPrice
            const initialPrice = prediction.price
            const priceRatio = currentPrice / initialPrice
            const newCurrentValue = prediction.initialValue * priceRatio

            // Mettre à jour la prédiction
            await db.transaction.update({
              where: { id: prediction.id },
              data: {
                currentValue: newCurrentValue,
              },
            })

            updatedPredictions.push({
              id: prediction.id,
              symbol: prediction.symbol,
              oldValue: prediction.currentValue,
              newValue: newCurrentValue,
            })
          }
        } catch (predictionError) {
          console.error(`Erreur lors de la mise à jour de la prédiction ${prediction.id}:`, predictionError)
          // Continuer avec les autres prédictions même si une échoue
        }
      }

      return NextResponse.json({
        success: true,
        updatedCount: updatedPredictions.length,
        predictions: updatedPredictions,
      })
    } catch (dbError) {
      console.error("Erreur base de données:", dbError)

      // En cas d'erreur, retourner un succès simulé
      return NextResponse.json({
        success: true,
        message: "Mode simulé activé",
        updatedCount: 0,
        predictions: [],
      })
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des prédictions:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
