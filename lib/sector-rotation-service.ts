import { getSectorMacroeconomicData, type SectorMacroeconomicData } from "./sector-macroeconomic-service"
import { getSectorComparisonData, type SectorComparisonData, getAllSectors } from "./sector-comparison-service"
import type { SectorType } from "./sector-classification"
import { getFromCache, saveToCache } from "./cache-utils"

// Types pour les données de rotation sectorielle
export interface SectorRotationSignal {
  fromSector: SectorType
  toSector: SectorType
  strength: number // 0-100
  confidence: number // 0-100
  reason: string
  timeframe: "immediate" | "short_term" | "medium_term" | "long_term"
  indicators: {
    name: string
    value: number
    trend: "improving" | "deteriorating" | "stable"
  }[]
  potentialGain: number // Gain potentiel estimé en pourcentage
  recommendedAllocation: number // Pourcentage recommandé d'allocation
  created: Date
}

export interface SectorCyclePosition {
  sector: SectorType
  sectorName: string
  currentPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction"
  phaseName: string
  phaseDescription: string
  momentum: number // -100 à 100
  relativeStrength: number // -100 à 100
  nextPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction"
  estimatedTimeToNextPhase: number // en jours
  optimalAllocation: number // 0-100
}

export interface SectorRotationDashboard {
  economicCycle: {
    currentPhase: "expansion" | "peak" | "contraction" | "trough"
    strength: number // 0-100
    duration: number // en jours
    estimatedTimeToNextPhase: number // en jours
  }
  topRotationSignals: SectorRotationSignal[]
  sectorCycles: SectorCyclePosition[]
  lastUpdated: Date
}

// Durée du cache pour les données de rotation sectorielle (2 heures)
const ROTATION_CACHE_DURATION = 2 * 60 * 60 * 1000

/**
 * Service pour analyser et optimiser les rotations sectorielles
 */
export class SectorRotationService {
  /**
   * Récupère le tableau de bord de rotation sectorielle
   */
  async getRotationDashboard(): Promise<SectorRotationDashboard> {
    // Vérifier le cache d'abord
    const cachedData = getFromCache<SectorRotationDashboard>("sector_rotation_dashboard")
    if (cachedData) {
      return cachedData
    }

    try {
      // Récupérer les données pour tous les secteurs
      const allSectors = getAllSectors().map((s) => s.type)
      const sectorDataPromises = allSectors.map((sector) => getSectorMacroeconomicData(sector))
      const sectorComparisonPromises = allSectors.map((sector) => getSectorComparisonData(sector))

      // Attendre toutes les données
      const [sectorMacroData, sectorComparisonData] = await Promise.all([
        Promise.all(sectorDataPromises),
        Promise.all(sectorComparisonPromises),
      ])

      // Analyser le cycle économique actuel
      const economicCycle = this.analyzeEconomicCycle(sectorMacroData)

      // Déterminer la position de chaque secteur dans le cycle
      const sectorCycles = this.analyzeSectorCycles(sectorMacroData, sectorComparisonData, economicCycle)

      // Générer les signaux de rotation
      const rotationSignals = this.generateRotationSignals(sectorCycles, sectorMacroData, sectorComparisonData)

      // Construire le tableau de bord
      const dashboard: SectorRotationDashboard = {
        economicCycle,
        topRotationSignals: rotationSignals.slice(0, 5), // Top 5 signaux
        sectorCycles,
        lastUpdated: new Date(),
      }

      // Sauvegarder dans le cache
      saveToCache<SectorRotationDashboard>("sector_rotation_dashboard", dashboard, ROTATION_CACHE_DURATION)

      return dashboard
    } catch (error) {
      console.error("Error generating sector rotation dashboard:", error)
      throw new Error(`Failed to generate sector rotation dashboard: ${error}`)
    }
  }

  /**
   * Récupère les signaux de rotation pour un secteur spécifique
   */
  async getRotationSignalsForSector(sector: SectorType): Promise<SectorRotationSignal[]> {
    try {
      // Récupérer le tableau de bord complet
      const dashboard = await this.getRotationDashboard()

      // Filtrer les signaux pour ce secteur (soit comme source, soit comme destination)
      return dashboard.topRotationSignals.filter((signal) => signal.fromSector === sector || signal.toSector === sector)
    } catch (error) {
      console.error(`Error getting rotation signals for sector ${sector}:`, error)
      return []
    }
  }

  /**
   * Analyse le cycle économique actuel
   */
  private analyzeEconomicCycle(sectorData: SectorMacroeconomicData[]): {
    currentPhase: "expansion" | "peak" | "contraction" | "trough"
    strength: number
    duration: number
    estimatedTimeToNextPhase: number
  } {
    // Indicateurs clés pour déterminer la phase du cycle
    const interestRateIndicator = this.findAverageIndicator(sectorData, "Taux directeur")
    const gdpGrowthIndicator = this.findAverageIndicator(sectorData, "Croissance du PIB")
    const inflationIndicator = this.findAverageIndicator(sectorData, "Taux d'inflation")
    const unemploymentIndicator = this.findAverageIndicator(sectorData, "Taux de chômage")

    // Calculer un score pour chaque phase
    const expansionScore =
      (gdpGrowthIndicator > 2 ? 1 : 0) +
      (inflationIndicator < 3 ? 1 : 0) +
      (unemploymentIndicator < 5 ? 1 : 0) +
      (interestRateIndicator < 3 ? 1 : 0)

    const peakScore =
      (gdpGrowthIndicator > 3 ? 1 : 0) +
      (inflationIndicator > 2 ? 1 : 0) +
      (unemploymentIndicator < 4 ? 1 : 0) +
      (interestRateIndicator > 2 && interestRateIndicator < 5 ? 1 : 0)

    const contractionScore =
      (gdpGrowthIndicator < 2 ? 1 : 0) +
      (inflationIndicator > 3 ? 1 : 0) +
      (unemploymentIndicator > 5 ? 1 : 0) +
      (interestRateIndicator > 4 ? 1 : 0)

    const troughScore =
      (gdpGrowthIndicator < 1 ? 1 : 0) +
      (inflationIndicator < 2 ? 1 : 0) +
      (unemploymentIndicator > 6 ? 1 : 0) +
      (interestRateIndicator < 2 ? 1 : 0)

    // Déterminer la phase actuelle
    const scores = [
      { phase: "expansion" as const, score: expansionScore },
      { phase: "peak" as const, score: peakScore },
      { phase: "contraction" as const, score: contractionScore },
      { phase: "trough" as const, score: troughScore },
    ]

    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score)

    // La phase avec le score le plus élevé est la phase actuelle
    const currentPhase = scores[0].phase

    // Calculer la force de la phase (0-100)
    const maxPossibleScore = 4 // 4 indicateurs, 1 point max par indicateur
    const strength = (scores[0].score / maxPossibleScore) * 100

    // Estimer la durée et le temps restant (valeurs simulées)
    const duration = 180 + Math.floor(Math.random() * 90) // 180-270 jours
    const estimatedTimeToNextPhase = 30 + Math.floor(Math.random() * 60) // 30-90 jours

    return {
      currentPhase,
      strength,
      duration,
      estimatedTimeToNextPhase,
    }
  }

  /**
   * Analyse la position de chaque secteur dans le cycle économique
   */
  private analyzeSectorCycles(
    sectorMacroData: SectorMacroeconomicData[],
    sectorComparisonData: SectorComparisonData[],
    economicCycle: {
      currentPhase: "expansion" | "peak" | "contraction" | "trough"
    },
  ): SectorCyclePosition[] {
    const sectorCycles: SectorCyclePosition[] = []

    // Pour chaque secteur, déterminer sa position dans le cycle
    for (let i = 0; i < sectorMacroData.length; i++) {
      const macroData = sectorMacroData[i]
      const comparisonData = sectorComparisonData[i]
      const sector = macroData.sector

      // Déterminer la phase du secteur en fonction de la phase économique globale
      // et des caractéristiques spécifiques du secteur
      let currentPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction"
      let nextPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction"

      // Logique pour déterminer la phase du secteur
      switch (economicCycle.currentPhase) {
        case "expansion":
          // Pendant l'expansion, les secteurs cycliques sont généralement en early_expansion ou late_expansion
          if (this.isCyclicalSector(sector)) {
            currentPhase = comparisonData.overallScore > 50 ? "late_expansion" : "early_expansion"
            nextPhase = currentPhase === "early_expansion" ? "late_expansion" : "early_contraction"
          } else {
            // Les secteurs défensifs peuvent être en retard ou en avance sur le cycle
            currentPhase = comparisonData.overallScore > 0 ? "early_expansion" : "late_contraction"
            nextPhase = currentPhase === "late_contraction" ? "early_expansion" : "late_expansion"
          }
          break

        case "peak":
          // Au pic, les secteurs cycliques sont généralement en late_expansion ou early_contraction
          if (this.isCyclicalSector(sector)) {
            currentPhase = comparisonData.overallScore > 30 ? "late_expansion" : "early_contraction"
            nextPhase = "early_contraction"
          } else {
            // Les secteurs défensifs commencent à devenir plus attractifs
            currentPhase = comparisonData.overallScore > 0 ? "late_expansion" : "early_expansion"
            nextPhase = currentPhase === "early_expansion" ? "late_expansion" : "early_contraction"
          }
          break

        case "contraction":
          // Pendant la contraction, les secteurs cycliques sont généralement en early_contraction ou late_contraction
          if (this.isCyclicalSector(sector)) {
            currentPhase = comparisonData.overallScore < -30 ? "late_contraction" : "early_contraction"
            nextPhase = currentPhase === "early_contraction" ? "late_contraction" : "early_expansion"
          } else {
            // Les secteurs défensifs peuvent surperformer
            currentPhase = comparisonData.overallScore < 0 ? "early_contraction" : "late_expansion"
            nextPhase = currentPhase === "late_expansion" ? "early_contraction" : "late_contraction"
          }
          break

        case "trough":
          // Au creux, les secteurs cycliques peuvent commencer à se redresser
          if (this.isCyclicalSector(sector)) {
            currentPhase = comparisonData.overallScore < -20 ? "late_contraction" : "early_expansion"
            nextPhase = "early_expansion"
          } else {
            // Les secteurs défensifs peuvent commencer à sous-performer
            currentPhase = comparisonData.overallScore < 0 ? "late_contraction" : "early_contraction"
            nextPhase = currentPhase === "early_contraction" ? "late_contraction" : "early_expansion"
          }
          break
      }

      // Calculer le momentum et la force relative
      const momentum = this.calculateSectorMomentum(macroData, comparisonData)
      const relativeStrength = comparisonData.overallScore

      // Estimer le temps jusqu'à la prochaine phase
      const estimatedTimeToNextPhase = this.estimateTimeToNextPhase(currentPhase, momentum)

      // Déterminer l'allocation optimale
      const optimalAllocation = this.calculateOptimalAllocation(currentPhase, momentum, relativeStrength)

      sectorCycles.push({
        sector,
        sectorName: this.getSectorName(sector),
        currentPhase,
        phaseName: this.getPhaseName(currentPhase),
        phaseDescription: this.getPhaseDescription(currentPhase, sector),
        momentum,
        relativeStrength,
        nextPhase,
        estimatedTimeToNextPhase,
        optimalAllocation,
      })
    }

    return sectorCycles
  }

  /**
   * Génère des signaux de rotation sectorielle
   */
  private generateRotationSignals(
    sectorCycles: SectorCyclePosition[],
    sectorMacroData: SectorMacroeconomicData[],
    sectorComparisonData: SectorComparisonData[],
  ): SectorRotationSignal[] {
    const signals: SectorRotationSignal[] = []

    // Pour chaque paire de secteurs, évaluer s'il y a une opportunité de rotation
    for (const fromSector of sectorCycles) {
      for (const toSector of sectorCycles) {
        // Ne pas comparer un secteur avec lui-même
        if (fromSector.sector === toSector.sector) {
          continue
        }

        // Calculer la différence de momentum et de force relative
        const momentumDiff = toSector.momentum - fromSector.momentum
        const strengthDiff = toSector.relativeStrength - fromSector.relativeStrength

        // Si le secteur de destination a un meilleur momentum et une meilleure force relative,
        // c'est potentiellement un bon signal de rotation
        if (momentumDiff > 20 && strengthDiff > 20) {
          // Calculer la force du signal (0-100)
          const signalStrength = (momentumDiff + strengthDiff) / 4

          // Calculer la confiance (0-100)
          const confidence = this.calculateSignalConfidence(fromSector, toSector, momentumDiff, strengthDiff)

          // Déterminer le timeframe
          const timeframe = this.determineTimeframe(momentumDiff, strengthDiff)

          // Générer la raison du signal
          const reason = this.generateRotationReason(fromSector, toSector, momentumDiff, strengthDiff)

          // Collecter les indicateurs pertinents
          const indicators = this.collectRelevantIndicators(fromSector.sector, toSector.sector, sectorMacroData)

          // Estimer le gain potentiel
          const potentialGain = this.estimatePotentialGain(fromSector, toSector)

          // Calculer l'allocation recommandée
          const recommendedAllocation = Math.min(80, Math.max(20, Math.round(confidence / 2 + signalStrength / 4)))

          signals.push({
            fromSector: fromSector.sector,
            toSector: toSector.sector,
            strength: Math.round(signalStrength),
            confidence: Math.round(confidence),
            reason,
            timeframe,
            indicators,
            potentialGain,
            recommendedAllocation,
            created: new Date(),
          })
        }
      }
    }

    // Trier les signaux par force et confiance
    return signals.sort((a, b) => b.strength * b.confidence - a.strength * a.confidence)
  }

  /**
   * Détermine si un secteur est cyclique
   */
  private isCyclicalSector(sector: SectorType): boolean {
    const cyclicalSectors: SectorType[] = [
      "technology",
      "consumer",
      "industrial",
      "financial",
      "materials",
      "real_estate",
    ]
    return cyclicalSectors.includes(sector)
  }

  /**
   * Calcule le momentum d'un secteur
   */
  private calculateSectorMomentum(macroData: SectorMacroeconomicData, comparisonData: SectorComparisonData): number {
    // Combiner les perspectives macroéconomiques et les données de comparaison
    const macroOutlookScore =
      macroData.sectorOutlook === "bullish"
        ? macroData.outlookStrength * 100
        : macroData.sectorOutlook === "bearish"
          ? -macroData.outlookStrength * 100
          : 0

    // Calculer le score de momentum des actions représentatives
    const stocksMomentum =
      comparisonData.representativeStocks.reduce((sum, stock) => {
        return sum + (stock.trend === "up" ? 1 : stock.trend === "down" ? -1 : 0)
      }, 0) / comparisonData.representativeStocks.length

    // Combiner les scores (60% macro, 40% actions)
    return Math.round(macroOutlookScore * 0.6 + stocksMomentum * 40)
  }

  /**
   * Estime le temps jusqu'à la prochaine phase
   */
  private estimateTimeToNextPhase(
    currentPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
    momentum: number,
  ): number {
    // Base: chaque phase dure environ 90 jours
    const baseTime = 90

    // Ajuster en fonction du momentum
    // Plus le momentum est fort, plus la transition sera rapide
    const momentumFactor = Math.abs(momentum) / 100

    return Math.round(baseTime * (1 - momentumFactor * 0.5))
  }

  /**
   * Calcule l'allocation optimale pour un secteur
   */
  private calculateOptimalAllocation(
    phase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
    momentum: number,
    relativeStrength: number,
  ): number {
    // Allocation de base selon la phase
    let baseAllocation = 0
    switch (phase) {
      case "early_expansion":
        baseAllocation = 80
        break
      case "late_expansion":
        baseAllocation = 60
        break
      case "early_contraction":
        baseAllocation = 30
        break
      case "late_contraction":
        baseAllocation = 20
        break
    }

    // Ajuster en fonction du momentum et de la force relative
    const momentumAdjustment = (momentum / 100) * 20 // -20 à +20
    const strengthAdjustment = (relativeStrength / 100) * 20 // -20 à +20

    // Calculer l'allocation finale
    return Math.min(100, Math.max(0, Math.round(baseAllocation + momentumAdjustment + strengthAdjustment)))
  }

  /**
   * Calcule la confiance d'un signal de rotation
   */
  private calculateSignalConfidence(
    fromSector: SectorCyclePosition,
    toSector: SectorCyclePosition,
    momentumDiff: number,
    strengthDiff: number,
  ): number {
    // Facteurs de confiance
    const phaseFactor = this.getPhaseTransitionConfidence(fromSector.currentPhase, toSector.currentPhase)
    const momentumFactor = Math.min(1, momentumDiff / 100)
    const strengthFactor = Math.min(1, strengthDiff / 100)

    // Combiner les facteurs
    return Math.round((phaseFactor * 0.4 + momentumFactor * 0.3 + strengthFactor * 0.3) * 100)
  }

  /**
   * Détermine le timeframe d'un signal de rotation
   */
  private determineTimeframe(
    momentumDiff: number,
    strengthDiff: number,
  ): "immediate" | "short_term" | "medium_term" | "long_term" {
    const totalDiff = momentumDiff + strengthDiff

    if (totalDiff > 100) return "immediate"
    if (totalDiff > 70) return "short_term"
    if (totalDiff > 40) return "medium_term"
    return "long_term"
  }

  /**
   * Génère une raison pour un signal de rotation
   */
  private generateRotationReason(
    fromSector: SectorCyclePosition,
    toSector: SectorCyclePosition,
    momentumDiff: number,
    strengthDiff: number,
  ): string {
    // Construire une raison basée sur les différences de phase, momentum et force
    let reason = `Rotation recommandée du secteur ${fromSector.sectorName} (${this.getPhaseName(
      fromSector.currentPhase,
    )}) vers ${toSector.sectorName} (${this.getPhaseName(toSector.currentPhase)}). `

    // Ajouter des détails sur le momentum
    if (momentumDiff > 50) {
      reason += `Le momentum du secteur ${toSector.sectorName} est significativement plus fort. `
    } else if (momentumDiff > 20) {
      reason += `Le momentum du secteur ${toSector.sectorName} est modérément plus fort. `
    }

    // Ajouter des détails sur la force relative
    if (strengthDiff > 50) {
      reason += `La force relative du secteur ${toSector.sectorName} est significativement plus élevée. `
    } else if (strengthDiff > 20) {
      reason += `La force relative du secteur ${toSector.sectorName} est modérément plus élevée. `
    }

    // Ajouter des détails sur la phase du cycle
    reason += `Le secteur ${toSector.sectorName} entre dans une phase favorable du cycle économique.`

    return reason
  }

  /**
   * Collecte les indicateurs pertinents pour une rotation sectorielle
   */
  private collectRelevantIndicators(
    fromSector: SectorType,
    toSector: SectorType,
    sectorMacroData: SectorMacroeconomicData[],
  ): {
    name: string
    value: number
    trend: "improving" | "deteriorating" | "stable"
  }[] {
    const indicators: {
      name: string
      value: number
      trend: "improving" | "deteriorating" | "stable"
    }[] = []

    // Trouver les données macro pour les secteurs concernés
    const fromSectorData = sectorMacroData.find((data) => data.sector === fromSector)
    const toSectorData = sectorMacroData.find((data) => data.sector === toSector)

    if (!fromSectorData || !toSectorData) {
      return indicators
    }

    // Collecter les indicateurs communs aux deux secteurs
    const commonIndicatorNames = fromSectorData.indicators
      .map((i) => i.name)
      .filter((name) => toSectorData.indicators.some((i) => i.name === name))

    for (const name of commonIndicatorNames) {
      const fromIndicator = fromSectorData.indicators.find((i) => i.name === name)
      const toIndicator = toSectorData.indicators.find((i) => i.name === name)

      if (fromIndicator && toIndicator) {
        // Déterminer la tendance
        let trend: "improving" | "deteriorating" | "stable" = "stable"

        if (
          (toIndicator.sectorImpact === "positive" && fromIndicator.sectorImpact !== "positive") ||
          (toIndicator.sectorImpact === "neutral" && fromIndicator.sectorImpact === "negative")
        ) {
          trend = "improving"
        } else if (
          (fromIndicator.sectorImpact === "positive" && toIndicator.sectorImpact !== "positive") ||
          (fromIndicator.sectorImpact === "neutral" && toIndicator.sectorImpact === "negative")
        ) {
          trend = "deteriorating"
        }

        // Ajouter l'indicateur
        indicators.push({
          name,
          value: toIndicator.value,
          trend,
        })
      }
    }

    // Limiter à 3 indicateurs les plus pertinents
    return indicators
      .sort((a, b) => {
        // Prioriser les indicateurs avec une tendance non stable
        if (a.trend !== "stable" && b.trend === "stable") return -1
        if (a.trend === "stable" && b.trend !== "stable") return 1
        return 0
      })
      .slice(0, 3)
  }

  /**
   * Estime le gain potentiel d'une rotation sectorielle
   */
  private estimatePotentialGain(fromSector: SectorCyclePosition, toSector: SectorCyclePosition): number {
    // Facteurs pour estimer le gain
    const momentumFactor = (toSector.momentum - fromSector.momentum) / 100
    const strengthFactor = (toSector.relativeStrength - fromSector.relativeStrength) / 100
    const phaseFactor = this.getPhaseTransitionGain(fromSector.currentPhase, toSector.currentPhase)

    // Calculer le gain potentiel (en pourcentage)
    const baseGain = 5 // Gain de base de 5%
    const adjustedGain = baseGain * (1 + momentumFactor + strengthFactor + phaseFactor)

    return Math.round(adjustedGain * 10) / 10 // Arrondir à 1 décimale
  }

  /**
   * Obtient la confiance d'une transition de phase
   */
  private getPhaseTransitionConfidence(
    fromPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
    toPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
  ): number {
    // Matrice de confiance pour les transitions de phase
    const confidenceMatrix: Record<
      string,
      Record<"early_expansion" | "late_expansion" | "early_contraction" | "late_contraction", number>
    > = {
      early_expansion: {
        early_expansion: 0.5, // Même phase
        late_expansion: 0.7, // Progression naturelle
        early_contraction: 0.3, // Saut de phase
        late_contraction: 0.1, // Saut important
      },
      late_expansion: {
        early_expansion: 0.3, // Retour en arrière
        late_expansion: 0.5, // Même phase
        early_contraction: 0.7, // Progression naturelle
        late_contraction: 0.3, // Saut de phase
      },
      early_contraction: {
        early_expansion: 0.1, // Saut important
        late_expansion: 0.3, // Saut de phase
        early_contraction: 0.5, // Même phase
        late_contraction: 0.7, // Progression naturelle
      },
      late_contraction: {
        early_expansion: 0.7, // Progression naturelle (cycle complet)
        late_expansion: 0.1, // Saut important
        early_contraction: 0.3, // Retour en arrière
        late_contraction: 0.5, // Même phase
      },
    }

    return confidenceMatrix[fromPhase][toPhase]
  }

  /**
   * Obtient le gain potentiel d'une transition de phase
   */
  private getPhaseTransitionGain(
    fromPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
    toPhase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
  ): number {
    // Matrice de gains pour les transitions de phase
    const gainMatrix: Record<
      string,
      Record<"early_expansion" | "late_expansion" | "early_contraction" | "late_contraction", number>
    > = {
      early_expansion: {
        early_expansion: 0, // Même phase
        late_expansion: 0.2, // Progression naturelle
        early_contraction: -0.2, // Saut de phase
        late_contraction: -0.5, // Saut important
      },
      late_expansion: {
        early_expansion: -0.2, // Retour en arrière
        late_expansion: 0, // Même phase
        early_contraction: -0.1, // Progression naturelle
        late_contraction: -0.3, // Saut de phase
      },
      early_contraction: {
        early_expansion: 0.5, // Saut important
        late_expansion: 0.2, // Saut de phase
        early_contraction: 0, // Même phase
        late_contraction: -0.1, // Progression naturelle
      },
      late_contraction: {
        early_expansion: 0.8, // Progression naturelle (cycle complet)
        late_expansion: 0.5, // Saut important
        early_contraction: -0.2, // Retour en arrière
        late_contraction: 0, // Même phase
      },
    }

    return gainMatrix[fromPhase][toPhase]
  }

  /**
   * Trouve la valeur moyenne d'un indicateur dans tous les secteurs
   */
  private findAverageIndicator(sectorData: SectorMacroeconomicData[], indicatorName: string): number {
    let sum = 0
    let count = 0

    for (const data of sectorData) {
      const indicator = data.indicators.find((i) => i.name === indicatorName)
      if (indicator) {
        sum += indicator.value
        count++
      }
    }

    return count > 0 ? sum / count : 0
  }

  /**
   * Obtient le nom lisible d'un secteur
   */
  private getSectorName(sector: SectorType): string {
    const sectorNames: Record<SectorType, string> = {
      technology: "Technologie",
      healthcare: "Santé",
      financial: "Finance",
      consumer: "Consommation",
      industrial: "Industrie",
      energy: "Énergie",
      utilities: "Services publics",
      materials: "Matériaux",
      communication: "Communication",
      real_estate: "Immobilier",
      unknown: "Inconnu",
    }

    return sectorNames[sector]
  }

  /**
   * Obtient le nom lisible d'une phase
   */
  private getPhaseName(phase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction"): string {
    const phaseNames: Record<string, string> = {
      early_expansion: "Début d'expansion",
      late_expansion: "Fin d'expansion",
      early_contraction: "Début de contraction",
      late_contraction: "Fin de contraction",
    }

    return phaseNames[phase]
  }

  /**
   * Obtient la description d'une phase pour un secteur
   */
  private getPhaseDescription(
    phase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
    sector: SectorType,
  ): string {
    // Descriptions génériques par phase
    const genericDescriptions: Record<string, string> = {
      early_expansion: "Phase de croissance initiale avec potentiel d'appréciation significatif.",
      late_expansion: "Phase de maturité avec croissance modérée et valorisations élevées.",
      early_contraction: "Phase de ralentissement avec pression sur les marges et les valorisations.",
      late_contraction: "Phase de stabilisation avec opportunités d'achat à des valorisations attractives.",
    }

    // On pourrait ajouter des descriptions spécifiques par secteur et phase
    // mais pour simplifier, on utilise les descriptions génériques
    return genericDescriptions[phase]
  }
}

// Exporter une instance du service
export const sectorRotationService = new SectorRotationService()
