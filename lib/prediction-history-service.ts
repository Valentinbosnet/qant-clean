import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import type { PredictionResult } from "./prediction-service"
import { isOfflineMode } from "./offline-mode"

// Type pour l'historique des prédictions
export interface PredictionHistoryEntry {
  id: number
  created_at: string
  user_id: string
  symbol: string
  algorithm: string
  prediction_date: string
  target_date: string
  predicted_price: number
  actual_price: number | null
  confidence: number
  prediction_data: PredictionResult
  is_completed: boolean
  accuracy?: number
}

// Type pour les métriques d'évaluation
export interface PredictionMetrics {
  totalPredictions: number
  completedPredictions: number
  averageAccuracy: number
  meanAbsoluteError: number
  meanPercentageError: number
  successRate: number // % de prédictions dans la bonne direction
}

// Type pour les métriques par algorithme
export interface AlgorithmPerformance {
  algorithm: string
  metrics: PredictionMetrics
  recentTrend: "improving" | "declining" | "stable"
}

/**
 * Sauvegarde une nouvelle prédiction dans l'historique
 */
export async function savePrediction(
  symbol: string,
  prediction: PredictionResult,
  targetDate: string,
): Promise<boolean> {
  try {
    // En mode hors ligne, simuler le succès
    if (isOfflineMode()) {
      console.log("Mode hors ligne: simulation de sauvegarde de prédiction")
      return true
    }

    const supabase = createClientComponentClient<Database>()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("Utilisateur non connecté")
      return false
    }

    // Extraire les données pertinentes de la prédiction
    const predictedPrice = prediction.points.find((p) => p.isEstimate)?.price || 0
    const confidence = prediction.metrics.confidence || 0.5

    // Insérer dans la base de données
    const { error } = await supabase.from("prediction_history").insert({
      user_id: session.user.id,
      symbol: symbol,
      algorithm: prediction.algorithm,
      prediction_date: new Date().toISOString(),
      target_date: targetDate,
      predicted_price: predictedPrice,
      actual_price: null, // Sera mis à jour une fois la date cible atteinte
      confidence: confidence,
      prediction_data: prediction as any,
      is_completed: false,
    })

    if (error) {
      console.error("Erreur lors de la sauvegarde de la prédiction:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la prédiction:", error)
    return false
  }
}

/**
 * Récupère l'historique des prédictions pour un utilisateur
 */
export async function getPredictionHistory(
  symbol?: string,
  algorithm?: string,
  limit = 50,
): Promise<PredictionHistoryEntry[]> {
  try {
    // En mode hors ligne, retourner des données simulées
    if (isOfflineMode()) {
      return generateMockPredictionHistory(symbol, algorithm, limit)
    }

    const supabase = createClientComponentClient<Database>()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("Utilisateur non connecté")
      return []
    }

    // Construire la requête
    let query = supabase
      .from("prediction_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    // Filtrer par symbole si spécifié
    if (symbol) {
      query = query.eq("symbol", symbol)
    }

    // Filtrer par algorithme si spécifié
    if (algorithm) {
      query = query.eq("algorithm", algorithm)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur lors de la récupération de l'historique des prédictions:", error)
      return []
    }

    return data as PredictionHistoryEntry[]
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des prédictions:", error)
    return []
  }
}

/**
 * Met à jour les prédictions complétées avec les prix réels
 */
export async function updateCompletedPredictions(): Promise<number> {
  try {
    // En mode hors ligne, simuler le succès
    if (isOfflineMode()) {
      return 0
    }

    const supabase = createClientComponentClient<Database>()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("Utilisateur non connecté")
      return 0
    }

    // Récupérer les prédictions non complétées dont la date cible est passée
    const today = new Date().toISOString()
    const { data, error } = await supabase
      .from("prediction_history")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_completed", false)
      .lt("target_date", today)

    if (error || !data) {
      console.error("Erreur lors de la récupération des prédictions à mettre à jour:", error)
      return 0
    }

    // Si aucune prédiction à mettre à jour
    if (data.length === 0) {
      return 0
    }

    // Pour chaque prédiction, récupérer le prix réel et mettre à jour
    let updatedCount = 0

    for (const prediction of data) {
      // Ici, vous devriez récupérer le prix réel à la date cible
      // Pour simplifier, nous utilisons un prix simulé
      const actualPrice = await getActualPriceAtDate(prediction.symbol, prediction.target_date)

      if (actualPrice) {
        // Calculer la précision (en pourcentage)
        const accuracy = calculateAccuracy(prediction.predicted_price, actualPrice)

        // Mettre à jour la prédiction
        const { error: updateError } = await supabase
          .from("prediction_history")
          .update({
            actual_price: actualPrice,
            is_completed: true,
            accuracy: accuracy,
          })
          .eq("id", prediction.id)

        if (!updateError) {
          updatedCount++
        }
      }
    }

    return updatedCount
  } catch (error) {
    console.error("Erreur lors de la mise à jour des prédictions complétées:", error)
    return 0
  }
}

/**
 * Récupère le prix réel d'une action à une date donnée
 */
async function getActualPriceAtDate(symbol: string, dateStr: string): Promise<number | null> {
  // Cette fonction devrait interroger votre API de données boursières
  // Pour simplifier, nous retournons un prix simulé
  try {
    // Simuler un prix réel (à remplacer par une vraie API)
    const date = new Date(dateStr)
    const today = new Date()

    // Si la date est future, retourner null
    if (date > today) {
      return null
    }

    // Simuler un prix basé sur le symbole et la date
    const basePrice = symbol.charCodeAt(0) + symbol.charCodeAt(1)
    const dayFactor = date.getDate() / 31
    return basePrice * (1 + dayFactor) * (0.9 + Math.random() * 0.2)
  } catch (error) {
    console.error("Erreur lors de la récupération du prix réel:", error)
    return null
  }
}

/**
 * Calcule la précision d'une prédiction
 */
function calculateAccuracy(predictedPrice: number, actualPrice: number): number {
  const percentageDifference = Math.abs((predictedPrice - actualPrice) / actualPrice)
  // Convertir en score de précision (100% - erreur%)
  return Math.max(0, 100 - percentageDifference * 100)
}

/**
 * Calcule les métriques d'évaluation pour les prédictions
 */
export async function calculatePredictionMetrics(symbol?: string, algorithm?: string): Promise<PredictionMetrics> {
  try {
    // Récupérer l'historique des prédictions
    const history = await getPredictionHistory(symbol, algorithm, 100)

    // Filtrer les prédictions complétées
    const completedPredictions = history.filter((p) => p.is_completed && p.actual_price !== null)

    if (completedPredictions.length === 0) {
      return {
        totalPredictions: history.length,
        completedPredictions: 0,
        averageAccuracy: 0,
        meanAbsoluteError: 0,
        meanPercentageError: 0,
        successRate: 0,
      }
    }

    // Calculer les métriques
    let totalAccuracy = 0
    let totalAbsoluteError = 0
    let totalPercentageError = 0
    let successCount = 0

    for (const prediction of completedPredictions) {
      if (prediction.actual_price) {
        // Précision
        totalAccuracy += prediction.accuracy || 0

        // Erreur absolue
        const absoluteError = Math.abs(prediction.predicted_price - prediction.actual_price)
        totalAbsoluteError += absoluteError

        // Erreur en pourcentage
        const percentageError = absoluteError / prediction.actual_price
        totalPercentageError += percentageError

        // Taux de succès (prédiction dans la bonne direction)
        const predictionDirection = prediction.predicted_price > prediction.prediction_data.points[0].price
        const actualDirection = prediction.actual_price > prediction.prediction_data.points[0].price
        if (predictionDirection === actualDirection) {
          successCount++
        }
      }
    }

    return {
      totalPredictions: history.length,
      completedPredictions: completedPredictions.length,
      averageAccuracy: totalAccuracy / completedPredictions.length,
      meanAbsoluteError: totalAbsoluteError / completedPredictions.length,
      meanPercentageError: (totalPercentageError / completedPredictions.length) * 100,
      successRate: (successCount / completedPredictions.length) * 100,
    }
  } catch (error) {
    console.error("Erreur lors du calcul des métriques de prédiction:", error)
    return {
      totalPredictions: 0,
      completedPredictions: 0,
      averageAccuracy: 0,
      meanAbsoluteError: 0,
      meanPercentageError: 0,
      successRate: 0,
    }
  }
}

/**
 * Récupère les performances par algorithme
 */
export async function getAlgorithmPerformance(): Promise<AlgorithmPerformance[]> {
  try {
    // En mode hors ligne, retourner des données simulées
    if (isOfflineMode()) {
      return generateMockAlgorithmPerformance()
    }

    const supabase = createClientComponentClient<Database>()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("Utilisateur non connecté")
      return []
    }

    // Récupérer tous les algorithmes utilisés
    const { data: algorithmsData, error: algorithmsError } = await supabase
      .from("prediction_history")
      .select("algorithm")
      .eq("user_id", session.user.id)
      .eq("is_completed", true)
      .order("algorithm", { ascending: true })

    if (algorithmsError || !algorithmsData) {
      console.error("Erreur lors de la récupération des algorithmes:", algorithmsError)
      return []
    }

    // Extraire les algorithmes uniques
    const algorithms = [...new Set(algorithmsData.map((item) => item.algorithm))]

    // Pour chaque algorithme, calculer les métriques
    const performances: AlgorithmPerformance[] = []

    for (const algorithm of algorithms) {
      const metrics = await calculatePredictionMetrics(undefined, algorithm)

      // Déterminer la tendance récente (simulée pour l'instant)
      const trend = determineTrend(algorithm)

      performances.push({
        algorithm,
        metrics,
        recentTrend: trend,
      })
    }

    return performances
  } catch (error) {
    console.error("Erreur lors de la récupération des performances par algorithme:", error)
    return []
  }
}

/**
 * Détermine la tendance récente d'un algorithme (simulé)
 */
function determineTrend(algorithm: string): "improving" | "declining" | "stable" {
  // Cette fonction devrait analyser les performances récentes
  // Pour simplifier, nous retournons une tendance aléatoire
  const random = Math.random()
  if (random < 0.33) return "improving"
  if (random < 0.66) return "declining"
  return "stable"
}

/**
 * Génère des données d'historique de prédiction simulées
 */
function generateMockPredictionHistory(symbol?: string, algorithm?: string, limit = 50): PredictionHistoryEntry[] {
  const algorithms = ["sma", "ema", "linear", "polynomial", "ensemble", "ai"]
  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"]

  const history: PredictionHistoryEntry[] = []

  for (let i = 0; i < limit; i++) {
    const useSymbol = symbol || symbols[Math.floor(Math.random() * symbols.length)]
    const useAlgorithm = algorithm || algorithms[Math.floor(Math.random() * algorithms.length)]

    // Générer des dates
    const today = new Date()
    const predictionDate = new Date(today)
    predictionDate.setDate(today.getDate() - (i + 10)) // Prédiction faite il y a (i+10) jours

    const targetDate = new Date(predictionDate)
    targetDate.setDate(predictionDate.getDate() + 7) // Prédiction pour 7 jours plus tard

    const isCompleted = targetDate <= today

    // Générer des prix
    const basePrice = useSymbol.charCodeAt(0) + useSymbol.charCodeAt(1)
    const predictedPrice = basePrice * (0.9 + Math.random() * 0.2)

    // Pour les prédictions complétées, générer un prix réel
    let actualPrice = null
    let accuracy = null

    if (isCompleted) {
      // Simuler une précision variable selon l'algorithme
      let accuracyFactor = 0.8
      if (useAlgorithm === "ai") accuracyFactor = 0.9
      if (useAlgorithm === "ensemble") accuracyFactor = 0.85

      // Générer un prix réel proche de la prédiction (selon l'algorithme)
      const errorMargin = (1 - accuracyFactor) * 0.5
      actualPrice = predictedPrice * (1 - errorMargin + Math.random() * errorMargin * 2)

      // Calculer la précision
      accuracy = calculateAccuracy(predictedPrice, actualPrice)
    }

    // Créer une entrée d'historique simulée
    history.push({
      id: i + 1,
      created_at: predictionDate.toISOString(),
      user_id: "user-123",
      symbol: useSymbol,
      algorithm: useAlgorithm,
      prediction_date: predictionDate.toISOString(),
      target_date: targetDate.toISOString(),
      predicted_price: predictedPrice,
      actual_price: actualPrice,
      confidence: 0.5 + Math.random() * 0.5,
      prediction_data: {
        symbol: useSymbol,
        algorithm: useAlgorithm,
        points: [
          { date: predictionDate.toISOString(), price: basePrice * 0.95, isEstimate: false },
          { date: targetDate.toISOString(), price: predictedPrice, isEstimate: true },
        ],
        metrics: {
          confidence: 0.5 + Math.random() * 0.5,
        },
        trend: Math.random() > 0.5 ? "up" : "down",
      } as any,
      is_completed: isCompleted,
      accuracy: accuracy,
    })
  }

  return history
}

/**
 * Génère des données de performance d'algorithme simulées
 */
function generateMockAlgorithmPerformance(): AlgorithmPerformance[] {
  const algorithms = ["sma", "ema", "linear", "polynomial", "ensemble", "ai"]

  return algorithms.map((algorithm) => {
    // Simuler des métriques différentes selon l'algorithme
    let baseAccuracy = 70
    if (algorithm === "ai") baseAccuracy = 85
    if (algorithm === "ensemble") baseAccuracy = 80
    if (algorithm === "linear") baseAccuracy = 65

    const randomFactor = Math.random() * 10 - 5 // -5 à +5

    return {
      algorithm,
      metrics: {
        totalPredictions: 50 + Math.floor(Math.random() * 50),
        completedPredictions: 30 + Math.floor(Math.random() * 20),
        averageAccuracy: baseAccuracy + randomFactor,
        meanAbsoluteError: 5 + Math.random() * 5,
        meanPercentageError: 8 + Math.random() * 4,
        successRate: baseAccuracy + randomFactor * 0.8,
      },
      recentTrend: determineTrend(algorithm),
    }
  })
}
