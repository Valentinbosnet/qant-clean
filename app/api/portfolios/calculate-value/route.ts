import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer l'ID du portfolio depuis le corps de la requête
    const { portfolioId } = await request.json()

    if (!portfolioId) {
      return NextResponse.json({ error: "ID de portfolio manquant" }, { status: 400 })
    }

    // Vérifier que le portfolio appartient à l'utilisateur
    const portfolio = await db.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: session.user.id,
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio non trouvé" }, { status: 404 })
    }

    // Récupérer toutes les transactions du portfolio
    const transactions = await db.transaction.findMany({
      where: {
        portfolioId,
        userId: session.user.id,
      },
    })

    // Calculer la valeur actuelle du portfolio
    const portfolioValue = portfolio.balance || 10000 // Valeur par défaut si balance est undefined
    let totalInvested = 0
    let currentValue = 0

    // Regrouper les transactions par symbole pour calculer les positions
    const positions: Record<string, { quantity: number; averagePrice: number; currentValue: number }> = {}

    // Calculer les positions
    for (const transaction of transactions) {
      const { type, symbol, amount, price } = transaction

      if (!positions[symbol]) {
        positions[symbol] = { quantity: 0, averagePrice: 0, currentValue: 0 }
      }

      if (type === "BUY") {
        // Mettre à jour la quantité et le prix moyen pour les achats
        const currentQuantity = positions[symbol].quantity
        const currentTotalValue = currentQuantity * positions[symbol].averagePrice
        const newQuantity = currentQuantity + amount
        const newTotalValue = currentTotalValue + amount * price

        positions[symbol].quantity = newQuantity
        positions[symbol].averagePrice = newQuantity > 0 ? newTotalValue / newQuantity : 0

        totalInvested += amount * price
      } else if (type === "SELL") {
        // Réduire la quantité pour les ventes
        positions[symbol].quantity -= amount

        // Si la quantité devient négative, la réinitialiser à 0
        if (positions[symbol].quantity < 0) {
          positions[symbol].quantity = 0
        }
      } else if (type === "PREDICTION") {
        // Pour les prédictions, utiliser la valeur actuelle si disponible
        if (transaction.currentValue) {
          positions[symbol].currentValue = transaction.currentValue
          currentValue += transaction.currentValue
        }
      }
    }

    // Simuler une mise à jour des prix actuels (dans un cas réel, vous utiliseriez une API de marché)
    for (const symbol in positions) {
      if (positions[symbol].quantity > 0 && positions[symbol].currentValue === 0) {
        // Simuler une fluctuation de prix de -10% à +20% par rapport au prix moyen
        const fluctuation = 0.9 + Math.random() * 0.3 // Entre 0.9 et 1.2
        const currentPrice = positions[symbol].averagePrice * fluctuation

        positions[symbol].currentValue = positions[symbol].quantity * currentPrice
        currentValue += positions[symbol].currentValue
      }
    }

    // Calculer le rendement
    const totalReturn = currentValue - totalInvested
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

    // Mettre à jour le portfolio avec les nouvelles valeurs
    const updatedPortfolio = await db.portfolio.update({
      where: { id: portfolioId },
      data: {
        currentValue: currentValue,
        totalInvested: totalInvested,
        returnValue: totalReturn,
        returnPercentage: returnPercentage,
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json({
      portfolio: updatedPortfolio,
      positions,
      totalInvested,
      currentValue,
      totalReturn,
      returnPercentage,
    })
  } catch (error) {
    console.error("Erreur lors du calcul de la valeur du portfolio:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
