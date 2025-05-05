// Service pour gérer les prédictions, leur mise à jour et leur expiration

import { getStockQuote } from "@/lib/stock-service"

// Structure pour stocker les prédictions en mémoire
interface Prediction {
  id: string
  type: string
  symbol: string
  amount: number
  price: number
  date: string
  expiryDate: string
  duration: number
  initialValue: number
  currentValue: number
  expectedReturn: number
  analysis?: string
  portfolioId: string
  userId: string
}

// Fonction pour mettre à jour la valeur actuelle d'une prédiction
export async function updatePredictionValue(prediction: Prediction): Promise<Prediction> {
  try {
    // Récupérer le prix actuel de l'actif
    const stockData = await getStockQuote(prediction.symbol)

    if (!stockData) {
      // Si les données ne sont pas disponibles, conserver la valeur actuelle
      return prediction
    }

    // Calculer la nouvelle valeur actuelle
    const currentPrice = stockData.currentPrice
    const initialPrice = prediction.price || 1 // Éviter la division par zéro
    const priceRatio = currentPrice / initialPrice
    const newCurrentValue = prediction.initialValue * priceRatio

    // Mettre à jour la prédiction
    return {
      ...prediction,
      currentValue: newCurrentValue,
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la prédiction ${prediction.id}:`, error)
    return prediction
  }
}

// Fonction pour vérifier si une prédiction est expirée
export function isPredictionExpired(prediction: Prediction): boolean {
  const expiryDate = new Date(prediction.expiryDate)
  const now = new Date()
  return expiryDate <= now
}

// Fonction pour calculer le gain/perte d'une prédiction
export function calculatePredictionGain(prediction: Prediction): { amount: number; percentage: number } {
  const gainAmount = prediction.currentValue - prediction.initialValue
  const gainPercentage = (gainAmount / prediction.initialValue) * 100

  return {
    amount: gainAmount,
    percentage: gainPercentage,
  }
}

// Fonction pour calculer le temps restant pour une prédiction
export function calculateRemainingTime(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(diffDays, 0)
}

// Fonction pour calculer le pourcentage de progression d'une prédiction
export function calculateProgress(startDate: string, expiryDate: string): number {
  const start = new Date(startDate)
  const expiry = new Date(expiryDate)
  const now = new Date()

  const totalDuration = expiry.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  return Math.min(Math.max(Math.floor((elapsed / totalDuration) * 100), 0), 100)
}
