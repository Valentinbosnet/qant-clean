import { getFromCache, saveToCache } from "./cache-utils"
import { getAllSectors } from "./sector-comparison-service"
import type { SectorType } from "./sector-classification"
import type { SectorRotationSignal } from "./sector-rotation-service"

// Durée du cache pour les backtests (24 heures)
const BACKTEST_CACHE_DURATION = 24 * 60 * 60 * 1000

// Types pour les données de backtest
export interface HistoricalSectorPerformance {
  date: string
  sector: SectorType
  sectorName: string
  indexValue: number
  percentChange1M: number
  percentChange3M: number
  percentChange6M: number
  percentChange1Y: number
  relativePerformance: number // Performance relative au S&P 500
}

export interface RotationBacktestResult {
  name: string
  description: string
  // Dates et performances
  dates: string[]
  performance: number[]
  benchmarkPerformance: number[]
  // Métriques globales
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  volatility: number
  alpha: number
  beta: number
  // Rotations
  rotations: RotationBacktestEvent[]
  // Données brutes par secteur
  sectorPerformances: Record<SectorType, HistoricalSectorPerformance[]>

  // Nouvelles métriques d'attribution de performance
  performanceAttribution: PerformanceAttribution
  riskMetrics: RiskMetrics
  drawdownAnalysis: DrawdownAnalysis
  monthlyPerformance: MonthlyPerformance[]
  rollingPerformance: RollingPerformance[]
  sectorAttribution: SectorAttribution[]
  decisionAttribution: DecisionAttribution
}

export interface RotationBacktestEvent {
  date: string
  fromSector: SectorType
  fromSectorName: string
  toSector: SectorType
  toSectorName: string
  reason: string
  signalStrength: number
  subsequentReturn1M: number
  subsequentReturn3M: number
  subsequentReturn6M: number
  success: boolean
}

export interface RotationStrategyConfig {
  name: string
  description: string
  signalThreshold: number
  rebalancePeriod: number // en jours
  includeSectors: SectorType[]
  excludeSectors: SectorType[]
  useMarketTiming: boolean
  riskManagement: {
    stopLoss: number // en pourcentage
    maxAllocationPerSector: number // en pourcentage
  }
}

// Nouvelles interfaces pour les métriques d'attribution
export interface PerformanceAttribution {
  sectorSelection: number // Contribution de la sélection de secteur
  marketTiming: number // Contribution du market timing
  sectorAllocation: number // Contribution de l'allocation entre secteurs
  other: number // Autres facteurs
  total: number // Performance totale
}

export interface RiskMetrics {
  sharpeRatio: number
  sortinoRatio: number // Mesure le risque de baisse uniquement
  informationRatio: number // Performance excédentaire par unité de risque relatif
  treynorRatio: number // Rendement excédentaire par unité de risque systématique
  calmarRatio: number // Rendement annualisé divisé par le drawdown maximal
  captureRatioUp: number // Capture de la hausse du marché
  captureRatioDown: number // Capture de la baisse du marché
  trackingError: number // Écart-type des rendements excédentaires
  var95: number // Value at Risk à 95%
  expectedShortfall: number // Perte moyenne au-delà du VaR
}

export interface DrawdownAnalysis {
  maxDrawdown: number
  maxDrawdownDuration: number // en jours
  maxDrawdownStartDate: string
  maxDrawdownEndDate: string
  maxDrawdownRecoveryDate: string
  averageDrawdown: number
  drawdownFrequency: number // nombre de drawdowns par an
  drawdowns: Drawdown[] // liste des principaux drawdowns
}

export interface Drawdown {
  startDate: string
  endDate: string
  recoveryDate: string
  depth: number // en pourcentage
  duration: number // en jours
  recoveryDuration: number // en jours
  sectorAtStart: string
}

export interface MonthlyPerformance {
  year: number
  month: number
  performance: number
  benchmarkPerformance: number
  excessReturn: number
}

export interface RollingPerformance {
  date: string
  rolling1M: number
  rolling3M: number
  rolling6M: number
  rolling1Y: number
  benchmarkRolling1M: number
  benchmarkRolling3M: number
  benchmarkRolling6M: number
  benchmarkRolling1Y: number
}

export interface SectorAttribution {
  sector: SectorType
  sectorName: string
  daysHeld: number
  percentageTimeHeld: number
  contribution: number
  contributionPercentage: number
  averageReturn: number
}

export interface DecisionAttribution {
  goodRotations: number // Nombre de rotations réussies
  badRotations: number // Nombre de rotations échouées
  missedOpportunities: number // Opportunités manquées
  falseSignals: number // Signaux qui n'auraient pas dû être suivis
  timingContribution: number // Contribution du timing des rotations
  sectorSelectionContribution: number // Contribution de la sélection des secteurs
  averageGoodRotationReturn: number // Rendement moyen des bonnes rotations
  averageBadRotationReturn: number // Rendement moyen des mauvaises rotations
}

/**
 * Service pour backtester les stratégies de rotation sectorielle
 */
export class SectorRotationBacktestService {
  // Données historiques simulées pour les performances des secteurs
  private historicalData: Record<SectorType, HistoricalSectorPerformance[]>

  constructor() {
    this.historicalData = this.generateHistoricalData()
  }

  /**
   * Exécute un backtest pour une stratégie de rotation
   * @param config Configuration de la stratégie
   * @param startDate Date de début du backtest
   * @param endDate Date de fin du backtest
   */
  async runBacktest(
    config: RotationStrategyConfig,
    startDate: string,
    endDate: string,
  ): Promise<RotationBacktestResult> {
    // Vérifier si le backtest est en cache
    const cacheKey = `backtest_${config.name}_${startDate}_${endDate}`
    const cachedResult = getFromCache<RotationBacktestResult>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // Filtrer les données historiques par date
    const filteredData = this.filterDataByDateRange(startDate, endDate)

    // Générer des signaux de rotation historiques
    const rotationSignals = this.generateHistoricalSignals(filteredData, config)

    // Calculer les performances
    const performance = this.calculateStrategyPerformance(rotationSignals, filteredData, config)

    // Calculer les performances du benchmark (S&P 500)
    const benchmarkPerformance = this.calculateBenchmarkPerformance(performance.dates)

    // Calculer les métriques de performance
    const metrics = this.calculatePerformanceMetrics(performance.performance, benchmarkPerformance)

    // Calculer les nouvelles métriques d'attribution
    const performanceAttribution = this.calculatePerformanceAttribution(
      performance,
      benchmarkPerformance,
      rotationSignals,
      filteredData,
      config,
    )

    const riskMetrics = this.calculateRiskMetrics(performance.performance, benchmarkPerformance, performance.dates)

    const drawdownAnalysis = this.calculateDrawdownAnalysis(performance.performance, performance.dates, rotationSignals)

    const monthlyPerformance = this.calculateMonthlyPerformance(
      performance.performance,
      benchmarkPerformance,
      performance.dates,
    )

    const rollingPerformance = this.calculateRollingPerformance(
      performance.performance,
      benchmarkPerformance,
      performance.dates,
    )

    const sectorAttribution = this.calculateSectorAttribution(performance, filteredData, rotationSignals)

    const decisionAttribution = this.calculateDecisionAttribution(rotationSignals, filteredData, performance.dates)

    // Construire le résultat
    const result: RotationBacktestResult = {
      name: config.name,
      description: config.description,
      dates: performance.dates,
      performance: performance.performance,
      benchmarkPerformance: benchmarkPerformance,
      totalReturn: metrics.totalReturn,
      annualizedReturn: metrics.annualizedReturn,
      maxDrawdown: metrics.maxDrawdown,
      sharpeRatio: metrics.sharpeRatio,
      volatility: metrics.volatility,
      alpha: metrics.alpha,
      beta: metrics.beta,
      rotations: performance.rotations,
      sectorPerformances: filteredData,

      // Nouvelles métriques d'attribution
      performanceAttribution,
      riskMetrics,
      drawdownAnalysis,
      monthlyPerformance,
      rollingPerformance,
      sectorAttribution,
      decisionAttribution,
    }

    // Sauvegarder dans le cache
    saveToCache<RotationBacktestResult>(cacheKey, result, BACKTEST_CACHE_DURATION)

    return result
  }

  /**
   * Exécute plusieurs backtests pour comparer différentes stratégies
   * @param configs Tableau de configurations de stratégies
   * @param startDate Date de début
   * @param endDate Date de fin
   */
  async compareStrategies(
    configs: RotationStrategyConfig[],
    startDate: string,
    endDate: string,
  ): Promise<RotationBacktestResult[]> {
    const results: RotationBacktestResult[] = []

    for (const config of configs) {
      const result = await this.runBacktest(config, startDate, endDate)
      results.push(result)
    }

    // Trier par performance totale décroissante
    return results.sort((a, b) => b.totalReturn - a.totalReturn)
  }

  /**
   * Récupère les performances historiques pour un secteur
   * @param sector Type de secteur
   * @param startDate Date de début
   * @param endDate Date de fin
   */
  getHistoricalSectorPerformance(
    sector: SectorType,
    startDate: string,
    endDate: string,
  ): HistoricalSectorPerformance[] {
    const filteredData = this.filterDataByDateRange(startDate, endDate)
    return filteredData[sector] || []
  }

  /**
   * Compare les performances historiques de deux secteurs
   * @param sector1 Premier secteur
   * @param sector2 Second secteur
   * @param startDate Date de début
   * @param endDate Date de fin
   */
  compareSectorPerformances(
    sector1: SectorType,
    sector2: SectorType,
    startDate: string,
    endDate: string,
  ): {
    dates: string[]
    sector1Performance: number[]
    sector2Performance: number[]
    relativeDifference: number[]
  } {
    const sector1Data = this.getHistoricalSectorPerformance(sector1, startDate, endDate)
    const sector2Data = this.getHistoricalSectorPerformance(sector2, startDate, endDate)

    // Construire les séries de données
    const dates: string[] = []
    const sector1Performance: number[] = []
    const sector2Performance: number[] = []
    const relativeDifference: number[] = []

    // Normaliser les séries à 100 au départ
    const startValue1 = sector1Data[0]?.indexValue || 100
    const startValue2 = sector2Data[0]?.indexValue || 100

    sector1Data.forEach((data, index) => {
      if (index < sector2Data.length) {
        dates.push(data.date)
        const normalizedValue1 = (data.indexValue / startValue1) * 100
        const normalizedValue2 = (sector2Data[index].indexValue / startValue2) * 100
        sector1Performance.push(normalizedValue1)
        sector2Performance.push(normalizedValue2)
        relativeDifference.push(normalizedValue1 - normalizedValue2)
      }
    })

    return {
      dates,
      sector1Performance,
      sector2Performance,
      relativeDifference,
    }
  }

  /**
   * Vérifie la précision d'un signal de rotation historique
   * @param signal Signal de rotation
   * @param actualPerformance Performances réelles
   */
  validateRotationSignal(
    signal: SectorRotationSignal,
    startDate: string,
    endDate: string,
  ): {
    signal: SectorRotationSignal
    validationResult: {
      success: boolean
      actualReturn1M: number
      actualReturn3M: number
      actualReturn6M: number
      fromSectorReturn1M: number
      toSectorReturn1M: number
      fromSectorReturn3M: number
      toSectorReturn3M: number
      performanceDifference: number
    }
  } {
    // Simuler des données de validation pour ce signal
    const signalDate = new Date().toISOString().split("T")[0]

    // Trouver les données historiques pour les secteurs
    const fromSectorData = this.getHistoricalSectorPerformance(signal.fromSector, startDate, endDate)
    const toSectorData = this.getHistoricalSectorPerformance(signal.toSector, startDate, endDate)

    // Simuler les retours réels à différents horizons
    // Dans une implémentation réelle, il faudrait trouver l'entrée correspondant à la date du signal
    const signalIndex = Math.min(30, fromSectorData.length - 10) // Pour simuler

    // Calculer les performances futures après le signal
    const fromSectorReturn1M = this.calculateReturnBetweenIndexes(fromSectorData, signalIndex, signalIndex + 4)
    const toSectorReturn1M = this.calculateReturnBetweenIndexes(toSectorData, signalIndex, signalIndex + 4)
    const fromSectorReturn3M = this.calculateReturnBetweenIndexes(fromSectorData, signalIndex, signalIndex + 12)
    const toSectorReturn3M = this.calculateReturnBetweenIndexes(toSectorData, signalIndex, signalIndex + 12)

    // Calculer le succès du signal
    const success = toSectorReturn3M > fromSectorReturn3M

    return {
      signal,
      validationResult: {
        success,
        actualReturn1M: toSectorReturn1M,
        actualReturn3M: toSectorReturn3M,
        actualReturn6M: toSectorReturn3M * 1.5, // Simulé
        fromSectorReturn1M,
        toSectorReturn1M,
        fromSectorReturn3M,
        toSectorReturn3M,
        performanceDifference: toSectorReturn3M - fromSectorReturn3M,
      },
    }
  }

  // Méthodes privées

  /**
   * Génère des données historiques simulées pour tous les secteurs
   */
  private generateHistoricalData(): Record<SectorType, HistoricalSectorPerformance[]> {
    const sectors = getAllSectors().map((s) => s.type)
    const startDate = new Date("2018-01-01")
    const endDate = new Date("2023-12-31")
    const data: Record<SectorType, HistoricalSectorPerformance[]> = {} as any

    // Base value for S&P 500 at the start
    const spBaseValue = 2800
    let spCurrentValue = spBaseValue

    // Generate S&P 500 index series first as benchmark
    const spValues: number[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Simple random walk with drift for S&P 500
      const dailyReturn = (Math.random() * 2 - 0.9) / 100 // -0.9% to 1.1% daily change
      spCurrentValue = spCurrentValue * (1 + dailyReturn)
      spValues.push(spCurrentValue)

      currentDate.setDate(currentDate.getDate() + 7) // Weekly data
    }

    // Reset date for sector generation
    currentDate = new Date(startDate)

    // Characteristics for each sector for simulation
    const sectorCharacteristics: Record<SectorType, { beta: number; alpha: number; volatility: number }> = {
      technology: { beta: 1.2, alpha: 0.0002, volatility: 1.5 },
      healthcare: { beta: 0.8, alpha: 0.0001, volatility: 0.9 },
      financial: { beta: 1.1, alpha: 0.0001, volatility: 1.2 },
      consumer: { beta: 0.9, alpha: 0.0001, volatility: 0.8 },
      industrial: { beta: 1.05, alpha: 0.0, volatility: 1.1 },
      energy: { beta: 1.15, alpha: -0.0001, volatility: 1.4 },
      utilities: { beta: 0.6, alpha: 0.0001, volatility: 0.7 },
      materials: { beta: 1.1, alpha: 0.0, volatility: 1.2 },
      communication: { beta: 1.0, alpha: 0.0001, volatility: 1.0 },
      real_estate: { beta: 0.9, alpha: 0.0001, volatility: 1.0 },
      unknown: { beta: 1.0, alpha: 0.0, volatility: 1.0 },
    }

    // Initialize data structure for each sector
    sectors.forEach((sector) => {
      data[sector] = []
    })

    // Generate data for each sector based on its characteristics
    let weekIndex = 0
    currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const spValue = spValues[weekIndex] || spBaseValue

      sectors.forEach((sector) => {
        const { beta, alpha, volatility } = sectorCharacteristics[sector]
        let previousValue = 0

        if (weekIndex === 0) {
          // Initial values for sectors
          previousValue = spBaseValue * (0.9 + Math.random() * 0.2) // 90% to 110% of S&P 500
        } else {
          previousValue = data[sector][weekIndex - 1].indexValue
        }

        // Calculate sector-specific return
        const marketReturn = spValue / (spValues[weekIndex - 1] || spBaseValue) - 1
        const sectorSpecificReturn = Math.random() * volatility * 0.01 - volatility * 0.005
        const sectorReturn = alpha + beta * marketReturn + sectorSpecificReturn

        const newValue = previousValue * (1 + sectorReturn)

        // Calculate periodic returns
        const oneMonthAgo = weekIndex >= 4 ? data[sector][weekIndex - 4].indexValue : previousValue
        const threeMonthsAgo = weekIndex >= 12 ? data[sector][weekIndex - 12].indexValue : previousValue
        const sixMonthsAgo = weekIndex >= 24 ? data[sector][weekIndex - 24].indexValue : previousValue
        const oneYearAgo = weekIndex >= 52 ? data[sector][weekIndex - 52].indexValue : previousValue

        data[sector].push({
          date: dateStr,
          sector,
          sectorName: this.getSectorName(sector),
          indexValue: newValue,
          percentChange1M: (newValue / oneMonthAgo - 1) * 100,
          percentChange3M: (newValue / threeMonthsAgo - 1) * 100,
          percentChange6M: (newValue / sixMonthsAgo - 1) * 100,
          percentChange1Y: (newValue / oneYearAgo - 1) * 100,
          relativePerformance: (newValue / previousValue - spValue / (spValues[weekIndex - 1] || spBaseValue)) * 100,
        })
      })

      weekIndex++
      currentDate.setDate(currentDate.getDate() + 7) // Weekly data
    }

    return data
  }

  /**
   * Filtre les données historiques par plage de dates
   */
  private filterDataByDateRange(startDate: string, endDate: string): Record<SectorType, HistoricalSectorPerformance[]> {
    const result: Record<SectorType, HistoricalSectorPerformance[]> = {} as any

    Object.entries(this.historicalData).forEach(([sector, data]) => {
      result[sector as SectorType] = data.filter((item) => item.date >= startDate && item.date <= endDate)
    })

    return result
  }

  /**
   * Génère des signaux de rotation historiques simulés
   */
  private generateHistoricalSignals(
    data: Record<SectorType, HistoricalSectorPerformance[]>,
    config: RotationStrategyConfig,
  ): RotationBacktestEvent[] {
    const signals: RotationBacktestEvent[] = []
    const sectorNames = Object.keys(data).filter(
      (sector) =>
        !config.excludeSectors.includes(sector as SectorType) &&
        (config.includeSectors.length === 0 || config.includeSectors.includes(sector as SectorType)),
    ) as SectorType[]

    if (sectorNames.length < 2) {
      return signals
    }

    // Utiliser un secteur quelconque pour obtenir les dates disponibles
    const availableDates = data[sectorNames[0]].map((item) => item.date)
    const rebalanceDates: string[] = []

    // Déterminer les dates de rééquilibrage selon la période configurée
    for (let i = 0; i < availableDates.length; i += Math.max(1, Math.floor(config.rebalancePeriod / 7))) {
      rebalanceDates.push(availableDates[i])
    }

    // Pour chaque date de rééquilibrage, générer potentiellement un signal
    for (let i = 0; i < rebalanceDates.length - 24; i++) {
      // Laisser 24 semaines à la fin pour mesurer les performances
      const date = rebalanceDates[i]

      // Trouver les meilleurs et pires secteurs sur les 3 derniers mois
      const bestSector = this.findBestPerformingSector(data, sectorNames, i, 12)
      const worstSector = this.findWorstPerformingSector(data, sectorNames, i, 12)

      // Ne pas générer de signal si les secteurs sont identiques
      if (bestSector === worstSector) {
        continue
      }

      // Calculer la force du signal (différence de performance)
      const bestSectorPerf = this.getSectorPerformance(data, bestSector, i, 12)
      const worstSectorPerf = this.getSectorPerformance(data, worstSector, i, 12)
      const signalStrength = bestSectorPerf - worstSectorPerf

      // Ne générer un signal que si la force dépasse le seuil configuré
      if (signalStrength > config.signalThreshold) {
        // Calculer les performances futures pour évaluer le succès du signal
        const subsequent1M =
          this.getSectorPerformance(data, bestSector, i, i + 4) - this.getSectorPerformance(data, worstSector, i, i + 4)
        const subsequent3M =
          this.getSectorPerformance(data, bestSector, i, i + 12) -
          this.getSectorPerformance(data, worstSector, i, i + 12)
        const subsequent6M =
          this.getSectorPerformance(data, bestSector, i, i + 24) -
          this.getSectorPerformance(data, worstSector, i, i + 24)

        signals.push({
          date,
          fromSector: worstSector,
          fromSectorName: this.getSectorName(worstSector),
          toSector: bestSector,
          toSectorName: this.getSectorName(bestSector),
          reason: `Rotation basée sur la différence de performance de ${signalStrength.toFixed(2)}% sur 3 mois`,
          signalStrength,
          subsequentReturn1M: subsequent1M,
          subsequentReturn3M: subsequent3M,
          subsequentReturn6M: subsequent6M,
          success: subsequent3M > 0,
        })
      }
    }

    return signals
  }

  /**
   * Calcule les performances d'une stratégie basée sur des signaux de rotation
   */
  private calculateStrategyPerformance(
    signals: RotationBacktestEvent[],
    data: Record<SectorType, HistoricalSectorPerformance[]>,
    config: RotationStrategyConfig,
  ): {
    dates: string[]
    performance: number[]
    rotations: RotationBacktestEvent[]
  } {
    // Utiliser un secteur quelconque pour obtenir les dates
    const sectors = Object.keys(data) as SectorType[]
    if (sectors.length === 0) {
      return { dates: [], performance: [], rotations: [] }
    }

    const availableDates = data[sectors[0]].map((item) => item.date)
    const performance: number[] = []

    // Valeur de départ
    let portfolioValue = 100

    // Secteur actuel dans le portefeuille (commencer par le premier secteur autorisé)
    let currentSector =
      config.includeSectors.length > 0
        ? config.includeSectors[0]
        : sectors.find((s) => !config.excludeSectors.includes(s)) || sectors[0]

    // Signaux appliqués
    const appliedSignals: RotationBacktestEvent[] = []

    // Pour chaque date, calculer la performance
    for (let i = 0; i < availableDates.length; i++) {
      const date = availableDates[i]

      // Vérifier s'il y a un signal à cette date
      const signal = signals.find((s) => s.date === date)
      if (signal && signal.toSector !== currentSector) {
        // Appliquer le signal
        currentSector = signal.toSector
        appliedSignals.push(signal)
      }

      // Calculer la performance journalière du secteur actuel
      if (i > 0) {
        const currentSectorData = data[currentSector]
        const previousValue = currentSectorData[i - 1]?.indexValue || 0
        const currentValue = currentSectorData[i]?.indexValue || 0

        if (previousValue > 0) {
          const dailyReturn = currentValue / previousValue - 1
          portfolioValue = portfolioValue * (1 + dailyReturn)

          // Appliquer le stop loss si configuré
          if (config.riskManagement.stopLoss > 0) {
            const stopLossThreshold = 1 - config.riskManagement.stopLoss / 100
            if (portfolioValue < 100 * stopLossThreshold) {
              // Réinitialiser à la limite de stop loss
              portfolioValue = 100 * stopLossThreshold
              // On pourrait ajouter une logique pour changer de secteur ici
            }
          }
        }
      }

      performance.push(portfolioValue)
    }

    return {
      dates: availableDates,
      performance,
      rotations: appliedSignals,
    }
  }

  /**
   * Calcule les performances du benchmark (S&P 500)
   */
  private calculateBenchmarkPerformance(dates: string[]): number[] {
    // Simuler une performance de type S&P 500
    const performance: number[] = []
    let portfolioValue = 100

    for (let i = 0; i < dates.length; i++) {
      if (i > 0) {
        // Simuler un rendement journalier avec une moyenne de +5% par an
        const dailyReturn = Math.random() * 0.01 - 0.002 + 0.0002 // -0.2% à 0.8% avec biais positif
        portfolioValue = portfolioValue * (1 + dailyReturn)
      }

      performance.push(portfolioValue)
    }

    return performance
  }

  /**
   * Calcule diverses métriques de performance
   */
  private calculatePerformanceMetrics(
    performance: number[],
    benchmarkPerformance: number[],
  ): {
    totalReturn: number
    annualizedReturn: number
    maxDrawdown: number
    sharpeRatio: number
    volatility: number
    alpha: number
    beta: number
  } {
    if (performance.length === 0 || benchmarkPerformance.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        volatility: 0,
        alpha: 0,
        beta: 0,
      }
    }

    // Calculer les rendements périodiques
    const returns: number[] = []
    const benchmarkReturns: number[] = []

    for (let i = 1; i < performance.length; i++) {
      returns.push(performance[i] / performance[i - 1] - 1)
      benchmarkReturns.push(benchmarkPerformance[i] / benchmarkPerformance[i - 1] - 1)
    }

    // Rendement total
    const totalReturn = (performance[performance.length - 1] / performance[0] - 1) * 100

    // Rendement annualisé (52 semaines par an)
    const years = performance.length / 52
    const annualizedReturn = (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100

    // Drawdown maximal
    let maxDrawdown = 0
    let peak = performance[0]

    for (let i = 1; i < performance.length; i++) {
      if (performance[i] > peak) {
        peak = performance[i]
      } else {
        const drawdown = (peak - performance[i]) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }

    // Volatilité (écart-type annualisé)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(52) * 100

    // Ratio de Sharpe (taux sans risque supposé à 1%)
    const riskFreeRate = 0.01 / 52 // Taux hebdomadaire
    const excessReturns = returns.map((r) => r - riskFreeRate)
    const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length
    const sharpeRatio = (meanExcessReturn / Math.sqrt(variance)) * Math.sqrt(52)

    // Beta et Alpha
    const covariance = this.calculateCovariance(returns, benchmarkReturns)
    const benchmarkVariance = this.calculateVariance(benchmarkReturns)
    const beta = covariance / benchmarkVariance

    const benchmarkMeanReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length
    const alpha = meanReturn - riskFreeRate - beta * (benchmarkMeanReturn - riskFreeRate)
    const annualizedAlpha = alpha * 52 * 100

    return {
      totalReturn,
      annualizedReturn,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio,
      volatility,
      alpha: annualizedAlpha,
      beta,
    }
  }

  /**
   * Trouve le secteur le plus performant sur une période donnée
   */
  private findBestPerformingSector(
    data: Record<SectorType, HistoricalSectorPerformance[]>,
    sectors: SectorType[],
    currentIndex: number,
    lookbackPeriod: number,
  ): SectorType {
    let bestSector = sectors[0]
    let bestPerformance = Number.NEGATIVE_INFINITY

    sectors.forEach((sector) => {
      const performance = this.getSectorPerformance(data, sector, currentIndex - lookbackPeriod, currentIndex)
      if (performance > bestPerformance) {
        bestPerformance = performance
        bestSector = sector
      }
    })

    return bestSector
  }

  /**
   * Trouve le secteur le moins performant sur une période donnée
   */
  private findWorstPerformingSector(
    data: Record<SectorType, HistoricalSectorPerformance[]>,
    sectors: SectorType[],
    currentIndex: number,
    lookbackPeriod: number,
  ): SectorType {
    let worstSector = sectors[0]
    let worstPerformance = Number.POSITIVE_INFINITY

    sectors.forEach((sector) => {
      const performance = this.getSectorPerformance(data, sector, currentIndex - lookbackPeriod, currentIndex)
      if (performance < worstPerformance) {
        worstPerformance = performance
        worstSector = sector
      }
    })

    return worstSector
  }

  /**
   * Calcule la performance d'un secteur entre deux indices
   */
  private getSectorPerformance(
    data: Record<SectorType, HistoricalSectorPerformance[]>,
    sector: SectorType,
    startIndex: number,
    endIndex: number,
  ): number {
    const sectorData = data[sector]
    if (!sectorData) return 0

    const validStartIndex = Math.max(0, startIndex)
    const validEndIndex = Math.min(sectorData.length - 1, endIndex)

    if (validStartIndex >= sectorData.length || validEndIndex < 0 || validStartIndex > validEndIndex) {
      return 0
    }

    const startValue = sectorData[validStartIndex].indexValue
    const endValue = sectorData[validEndIndex].indexValue

    return (endValue / startValue - 1) * 100
  }

  /**
   * Calcule le rendement entre deux indices dans une série de données
   */
  private calculateReturnBetweenIndexes(
    data: HistoricalSectorPerformance[],
    startIndex: number,
    endIndex: number,
  ): number {
    if (startIndex < 0 || endIndex >= data.length || startIndex >= endIndex) {
      return 0
    }

    const startValue = data[startIndex].indexValue
    const endValue = data[endIndex].indexValue

    return (endValue / startValue - 1) * 100
  }

  /**
   * Calcule la covariance entre deux séries
   */
  private calculateCovariance(series1: number[], series2: number[]): number {
    const minLength = Math.min(series1.length, series2.length)
    if (minLength === 0) return 0

    const mean1 = series1.slice(0, minLength).reduce((sum, val) => sum + val, 0) / minLength
    const mean2 = series2.slice(0, minLength).reduce((sum, val) => sum + val, 0) / minLength

    let covariance = 0
    for (let i = 0; i < minLength; i++) {
      covariance += (series1[i] - mean1) * (series2[i] - mean2)
    }

    return covariance / minLength
  }

  /**
   * Calcule la variance d'une série
   */
  private calculateVariance(series: number[]): number {
    if (series.length === 0) return 0

    const mean = series.reduce((sum, val) => sum + val, 0) / series.length

    let variance = 0
    for (let i = 0; i < series.length; i++) {
      variance += Math.pow(series[i] - mean, 2)
    }

    return variance / series.length
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
   * Calcule l'attribution de performance
   */
  private calculatePerformanceAttribution(
    performance: { dates: string[]; performance: number[]; rotations: RotationBacktestEvent[] },
    benchmarkPerformance: number[],
    rotationSignals: RotationBacktestEvent[],
    sectorData: Record<SectorType, HistoricalSectorPerformance[]>,
    config: RotationStrategyConfig,
  ): PerformanceAttribution {
    // Calculer la performance totale
    const totalPerformance =
      performance.performance.length > 0
        ? (performance.performance[performance.performance.length - 1] / performance.performance[0] - 1) * 100
        : 0

    // Calculer la performance du benchmark
    const benchmarkTotal =
      benchmarkPerformance.length > 0
        ? (benchmarkPerformance[benchmarkPerformance.length - 1] / benchmarkPerformance[0] - 1) * 100
        : 0

    // Calculer la surperformance totale
    const excessReturn = totalPerformance - benchmarkTotal

    // Estimer la contribution de la sélection de secteur
    // On utilise les rotations réussies comme proxy
    const successfulRotations = rotationSignals.filter((r) => r.success)
    const sectorSelectionContribution =
      successfulRotations.length > 0
        ? successfulRotations.reduce((sum, r) => sum + r.subsequentReturn3M, 0) / 3 // Diviser par 3 pour normaliser
        : 0

    // Estimer la contribution du market timing
    // Basé sur la différence entre la performance réelle et celle qu'on aurait eue en restant dans le premier secteur
    let firstSectorPerformance = 0
    if (performance.rotations.length > 0 && sectorData[performance.rotations[0].fromSector]) {
      const firstSectorData = sectorData[performance.rotations[0].fromSector]
      firstSectorPerformance =
        firstSectorData.length > 0
          ? (firstSectorData[firstSectorData.length - 1].indexValue / firstSectorData[0].indexValue - 1) * 100
          : 0
    }

    const marketTimingContribution = totalPerformance - firstSectorPerformance

    // Estimer la contribution de l'allocation entre secteurs
    // Basé sur la pondération des secteurs dans le temps
    const sectorAllocationContribution = excessReturn * 0.3 // Simplification: 30% de la surperformance

    // Autres facteurs (résidu)
    const otherContribution =
      totalPerformance - sectorSelectionContribution - marketTimingContribution - sectorAllocationContribution

    return {
      sectorSelection: Math.min(Math.max(sectorSelectionContribution, 0), totalPerformance),
      marketTiming: Math.min(Math.max(marketTimingContribution, -totalPerformance), totalPerformance),
      sectorAllocation: Math.min(Math.max(sectorAllocationContribution, 0), totalPerformance),
      other: Math.min(Math.max(otherContribution, -totalPerformance / 2), totalPerformance / 2),
      total: totalPerformance,
    }
  }

  /**
   * Calcule des métriques de risque avancées
   */
  private calculateRiskMetrics(performance: number[], benchmarkPerformance: number[], dates: string[]): RiskMetrics {
    if (performance.length < 2 || benchmarkPerformance.length < 2) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        informationRatio: 0,
        treynorRatio: 0,
        calmarRatio: 0,
        captureRatioUp: 0,
        captureRatioDown: 0,
        trackingError: 0,
        var95: 0,
        expectedShortfall: 0,
      }
    }

    // Calculer les rendements périodiques
    const returns: number[] = []
    const benchmarkReturns: number[] = []
    const excessReturns: number[] = []

    for (let i = 1; i < performance.length; i++) {
      const ret = performance[i] / performance[i - 1] - 1
      const benchRet = benchmarkPerformance[i] / benchmarkPerformance[i - 1] - 1
      returns.push(ret)
      benchmarkReturns.push(benchRet)
      excessReturns.push(ret - benchRet)
    }

    // Taux sans risque hebdomadaire (1% annuel)
    const riskFreeRate = 0.01 / 52

    // Moyenne des rendements
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const meanBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length
    const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length

    // Volatilité (écart-type annualisé)
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(52)

    // Tracking error (écart-type des rendements excédentaires)
    const trackingErrorVariance =
      excessReturns.reduce((sum, r) => sum + Math.pow(r - meanExcessReturn, 2), 0) / excessReturns.length
    const trackingError = Math.sqrt(trackingErrorVariance) * Math.sqrt(52)

    // Ratio de Sharpe
    const excessReturnOverRiskFree = meanReturn - riskFreeRate
    const sharpeRatio = (excessReturnOverRiskFree / Math.sqrt(variance)) * Math.sqrt(52)

    // Ratio de Sortino (utilise uniquement les rendements négatifs pour la volatilité)
    const negativeReturns = returns.filter((r) => r < 0)
    const downSideDeviation =
      negativeReturns.length > 0
        ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length) *
          Math.sqrt(52)
        : 0.0001 // Éviter la division par zéro
    const sortinoRatio = (excessReturnOverRiskFree / downSideDeviation) * Math.sqrt(52)

    // Ratio d'information
    const informationRatio = (meanExcessReturn / Math.sqrt(trackingErrorVariance)) * Math.sqrt(52)

    // Beta
    const covariance = this.calculateCovariance(returns, benchmarkReturns)
    const benchmarkVariance = this.calculateVariance(benchmarkReturns)
    const beta = covariance / benchmarkVariance

    // Ratio de Treynor
    const treynorRatio = beta !== 0 ? (excessReturnOverRiskFree / beta) * 52 : 0

    // Drawdown maximal
    let maxDrawdown = 0
    let peak = performance[0]

    for (let i = 1; i < performance.length; i++) {
      if (performance[i] > peak) {
        peak = performance[i]
      } else {
        const drawdown = (peak - performance[i]) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }

    // Ratio de Calmar
    const annualizedReturn = Math.pow(performance[performance.length - 1] / performance[0], 52 / performance.length) - 1
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0

    // Ratios de capture
    const upMarketReturns = returns.filter((r, i) => benchmarkReturns[i] > 0)
    const downMarketReturns = returns.filter((r, i) => benchmarkReturns[i] < 0)
    const upMarketBenchmarkReturns = benchmarkReturns.filter((r) => r > 0)
    const downMarketBenchmarkReturns = benchmarkReturns.filter((r) => r < 0)

    const avgUpReturn =
      upMarketReturns.length > 0 ? upMarketReturns.reduce((sum, r) => sum + r, 0) / upMarketReturns.length : 0
    const avgDownReturn =
      downMarketReturns.length > 0 ? downMarketReturns.reduce((sum, r) => sum + r, 0) / downMarketReturns.length : 0
    const avgUpBenchmarkReturn =
      upMarketBenchmarkReturns.length > 0
        ? upMarketBenchmarkReturns.reduce((sum, r) => sum + r, 0) / upMarketBenchmarkReturns.length
        : 0.0001
    const avgDownBenchmarkReturn =
      downMarketBenchmarkReturns.length > 0
        ? downMarketBenchmarkReturns.reduce((sum, r) => sum + r, 0) / downMarketBenchmarkReturns.length
        : -0.0001

    const captureRatioUp = avgUpReturn / avgUpBenchmarkReturn
    const captureRatioDown = avgDownReturn / avgDownBenchmarkReturn

    // Value at Risk (VaR) à 95%
    const sortedReturns = [...returns].sort((a, b) => a - b)
    const var95Index = Math.floor(sortedReturns.length * 0.05)
    const var95 = -sortedReturns[var95Index] * 100

    // Expected Shortfall (Conditional VaR)
    const tailReturns = sortedReturns.slice(0, var95Index + 1)
    const expectedShortfall =
      tailReturns.length > 0 ? (-tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length) * 100 : 0

    return {
      sharpeRatio,
      sortinoRatio,
      informationRatio,
      treynorRatio,
      calmarRatio,
      captureRatioUp,
      captureRatioDown,
      trackingError: trackingError * 100, // En pourcentage
      var95,
      expectedShortfall,
    }
  }

  /**
   * Analyse détaillée des drawdowns
   */
  private calculateDrawdownAnalysis(
    performance: number[],
    dates: string[],
    rotations: RotationBacktestEvent[],
  ): DrawdownAnalysis {
    if (performance.length < 2) {
      return {
        maxDrawdown: 0,
        maxDrawdownDuration: 0,
        maxDrawdownStartDate: "",
        maxDrawdownEndDate: "",
        maxDrawdownRecoveryDate: "",
        averageDrawdown: 0,
        drawdownFrequency: 0,
        drawdowns: [],
      }
    }

    // Trouver tous les drawdowns
    const drawdowns: Drawdown[] = []
    let inDrawdown = false
    let peak = performance[0]
    let peakIndex = 0
    let trough = peak
    let troughIndex = 0
    let currentDrawdownDepth = 0

    // Pour chaque point, vérifier s'il y a un drawdown
    for (let i = 1; i < performance.length; i++) {
      if (performance[i] >= peak) {
        // Nouveau sommet
        if (inDrawdown) {
          // Fin d'un drawdown avec récupération
          const recoveryDate = dates[i]
          const depth = ((peak - trough) / peak) * 100
          const duration = troughIndex - peakIndex
          const recoveryDuration = i - troughIndex

          // Trouver le secteur au début du drawdown
          const sectorAtStart = this.findSectorAtDate(rotations, dates[peakIndex])

          // Ajouter le drawdown s'il est significatif (> 1%)
          if (depth > 1) {
            drawdowns.push({
              startDate: dates[peakIndex],
              endDate: dates[troughIndex],
              recoveryDate,
              depth,
              duration,
              recoveryDuration,
              sectorAtStart,
            })
          }

          inDrawdown = false
        }

        peak = performance[i]
        peakIndex = i
        trough = peak
        troughIndex = i
        currentDrawdownDepth = 0
      } else if (performance[i] < trough) {
        // Nouveau creux
        trough = performance[i]
        troughIndex = i
        currentDrawdownDepth = ((peak - trough) / peak) * 100
        inDrawdown = true
      }
    }

    // Ajouter le dernier drawdown s'il est en cours
    if (inDrawdown && currentDrawdownDepth > 1) {
      const sectorAtStart = this.findSectorAtDate(rotations, dates[peakIndex])

      drawdowns.push({
        startDate: dates[peakIndex],
        endDate: dates[troughIndex],
        recoveryDate: "", // Pas encore récupéré
        depth: currentDrawdownDepth,
        duration: troughIndex - peakIndex,
        recoveryDuration: 0, // Pas encore récupéré
        sectorAtStart,
      })
    }

    // Trier les drawdowns par profondeur
    drawdowns.sort((a, b) => b.depth - a.depth)

    // Calculer les métriques de drawdown
    const maxDrawdown = drawdowns.length > 0 ? drawdowns[0].depth : 0
    const maxDrawdownDuration = drawdowns.length > 0 ? drawdowns[0].duration : 0
    const maxDrawdownStartDate = drawdowns.length > 0 ? drawdowns[0].startDate : ""
    const maxDrawdownEndDate = drawdowns.length > 0 ? drawdowns[0].endDate : ""
    const maxDrawdownRecoveryDate = drawdowns.length > 0 ? drawdowns[0].recoveryDate : ""

    const totalDrawdownDepth = drawdowns.reduce((sum, d) => sum + d.depth, 0)
    const averageDrawdown = drawdowns.length > 0 ? totalDrawdownDepth / drawdowns.length : 0

    // Calculer la fréquence des drawdowns (nombre par an)
    const years = performance.length / 52 // Supposer des données hebdomadaires
    const drawdownFrequency = years > 0 ? drawdowns.length / years : 0

    return {
      maxDrawdown,
      maxDrawdownDuration,
      maxDrawdownStartDate,
      maxDrawdownEndDate,
      maxDrawdownRecoveryDate,
      averageDrawdown,
      drawdownFrequency,
      drawdowns: drawdowns.slice(0, 10), // Garder les 10 plus importants
    }
  }

  /**
   * Trouve le secteur détenu à une date donnée
   */
  private findSectorAtDate(rotations: RotationBacktestEvent[], date: string): string {
    // Trouver la dernière rotation avant ou à la date donnée
    const relevantRotations = rotations.filter((r) => r.date <= date)
    if (relevantRotations.length === 0) {
      return "Inconnu" // Pas de rotation avant cette date
    }

    // Trier par date décroissante et prendre la plus récente
    relevantRotations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return relevantRotations[0].toSectorName
  }

  /**
   * Calcule les performances mensuelles
   */
  private calculateMonthlyPerformance(
    performance: number[],
    benchmarkPerformance: number[],
    dates: string[],
  ): MonthlyPerformance[] {
    if (performance.length < 2 || dates.length < 2) {
      return []
    }

    const monthlyPerformance: MonthlyPerformance[] = []
    const monthMap: Record<
      string,
      {
        startIndex: number
        endIndex: number
        startPerf: number
        endPerf: number
        startBench: number
        endBench: number
      }
    > = {}

    // Regrouper par mois
    dates.forEach((dateStr, index) => {
      const date = new Date(dateStr)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          startIndex: index,
          endIndex: index,
          startPerf: performance[index],
          endPerf: performance[index],
          startBench: benchmarkPerformance[index],
          endBench: benchmarkPerformance[index],
        }
      } else {
        monthMap[monthKey].endIndex = index
        monthMap[monthKey].endPerf = performance[index]
        monthMap[monthKey].endBench = benchmarkPerformance[index]
      }
    })

    // Calculer les performances mensuelles
    Object.entries(monthMap).forEach(([monthKey, data]) => {
      const [yearStr, monthStr] = monthKey.split("-")
      const year = Number.parseInt(yearStr)
      const month = Number.parseInt(monthStr)

      const monthPerf = (data.endPerf / data.startPerf - 1) * 100
      const benchPerf = (data.endBench / data.startBench - 1) * 100

      monthlyPerformance.push({
        year,
        month,
        performance: monthPerf,
        benchmarkPerformance: benchPerf,
        excessReturn: monthPerf - benchPerf,
      })
    })

    // Trier par date
    return monthlyPerformance.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  }

  /**
   * Calcule les performances glissantes
   */
  private calculateRollingPerformance(
    performance: number[],
    benchmarkPerformance: number[],
    dates: string[],
  ): RollingPerformance[] {
    if (performance.length < 52 || dates.length < 52) {
      // Au moins un an de données
      return []
    }

    const rollingPerformance: RollingPerformance[] = []

    // Périodes glissantes en semaines
    const periods = {
      rolling1M: 4,
      rolling3M: 13,
      rolling6M: 26,
      rolling1Y: 52,
    }

    // Calculer pour chaque date à partir des périodes requises
    for (let i = Math.max(periods.rolling1Y, 0); i < performance.length; i++) {
      const rolling1M = (performance[i] / performance[i - periods.rolling1M] - 1) * 100
      const rolling3M = (performance[i] / performance[i - periods.rolling3M] - 1) * 100
      const rolling6M = (performance[i] / performance[i - periods.rolling6M] - 1) * 100
      const rolling1Y = (performance[i] / performance[i - periods.rolling1Y] - 1) * 100

      const benchmarkRolling1M = (benchmarkPerformance[i] / benchmarkPerformance[i - periods.rolling1M] - 1) * 100
      const benchmarkRolling3M = (benchmarkPerformance[i] / benchmarkPerformance[i - periods.rolling3M] - 1) * 100
      const benchmarkRolling6M = (benchmarkPerformance[i] / benchmarkPerformance[i - periods.rolling6M] - 1) * 100
      const benchmarkRolling1Y = (benchmarkPerformance[i] / benchmarkPerformance[i - periods.rolling1Y] - 1) * 100

      rollingPerformance.push({
        date: dates[i],
        rolling1M,
        rolling3M,
        rolling6M,
        rolling1Y,
        benchmarkRolling1M,
        benchmarkRolling3M,
        benchmarkRolling6M,
        benchmarkRolling1Y,
      })
    }

    return rollingPerformance
  }

  /**
   * Calcule l'attribution par secteur
   */
  private calculateSectorAttribution(
    performance: { dates: string[]; performance: number[]; rotations: RotationBacktestEvent[] },
    sectorData: Record<SectorType, HistoricalSectorPerformance[]>,
    rotationSignals: RotationBacktestEvent[],
  ): SectorAttribution[] {
    if (performance.rotations.length === 0) {
      return []
    }

    const sectorAttribution: Record<
      SectorType,
      {
        daysHeld: number
        returns: number[]
        contribution: number
      }
    > = {}

    // Initialiser les secteurs
    const sectors = Object.keys(sectorData) as SectorType[]
    sectors.forEach((sector) => {
      sectorAttribution[sector] = {
        daysHeld: 0,
        returns: [],
        contribution: 0,
      }
    })

    // Déterminer le secteur détenu à chaque date
    let currentSector: SectorType | null = null
    let lastPerformance = performance.performance[0]

    performance.dates.forEach((date, index) => {
      // Vérifier s'il y a une rotation à cette date
      const rotation = performance.rotations.find((r) => r.date === date)
      if (rotation) {
        currentSector = rotation.toSector
      }

      // Si nous avons un secteur actif, mettre à jour ses statistiques
      if (currentSector) {
        sectorAttribution[currentSector].daysHeld++

        // Calculer le rendement pour cette période
        if (index > 0) {
          const periodReturn = performance.performance[index] / lastPerformance - 1
          sectorAttribution[currentSector].returns.push(periodReturn)

          // Ajouter à la contribution totale
          sectorAttribution[currentSector].contribution += periodReturn * 100
        }
      }

      lastPerformance = performance.performance[index]
    })

    // Calculer les statistiques finales
    const totalDays = performance.dates.length
    const totalReturn =
      performance.performance.length > 0
        ? (performance.performance[performance.performance.length - 1] / performance.performance[0] - 1) * 100
        : 0

    const result: SectorAttribution[] = []

    sectors.forEach((sector) => {
      const data = sectorAttribution[sector]
      if (data.daysHeld > 0) {
        const percentageTimeHeld = (data.daysHeld / totalDays) * 100
        const averageReturn =
          data.returns.length > 0 ? (data.returns.reduce((sum, r) => sum + r, 0) / data.returns.length) * 100 : 0

        const contributionPercentage = totalReturn !== 0 ? (data.contribution / totalReturn) * 100 : 0

        result.push({
          sector,
          sectorName: this.getSectorName(sector),
          daysHeld: data.daysHeld,
          percentageTimeHeld,
          contribution: data.contribution,
          contributionPercentage,
          averageReturn,
        })
      }
    })

    // Trier par contribution décroissante
    return result.sort((a, b) => b.contribution - a.contribution)
  }

  /**
   * Calcule l'attribution par décision
   */
  private calculateDecisionAttribution(
    rotationSignals: RotationBacktestEvent[],
    sectorData: Record<SectorType, HistoricalSectorPerformance[]>,
    dates: string[],
  ): DecisionAttribution {
    if (rotationSignals.length === 0) {
      return {
        goodRotations: 0,
        badRotations: 0,
        missedOpportunities: 0,
        falseSignals: 0,
        timingContribution: 0,
        sectorSelectionContribution: 0,
        averageGoodRotationReturn: 0,
        averageBadRotationReturn: 0,
      }
    }

    // Compter les bonnes et mauvaises rotations
    const goodRotations = rotationSignals.filter((r) => r.success)
    const badRotations = rotationSignals.filter((r) => !r.success)

    // Calculer les rendements moyens
    const goodRotationReturns = goodRotations.map((r) => r.subsequentReturn3M)
    const badRotationReturns = badRotations.map((r) => r.subsequentReturn3M)

    const averageGoodRotationReturn =
      goodRotationReturns.length > 0
        ? goodRotationReturns.reduce((sum, r) => sum + r, 0) / goodRotationReturns.length
        : 0

    const averageBadRotationReturn =
      badRotationReturns.length > 0 ? badRotationReturns.reduce((sum, r) => sum + r, 0) / badRotationReturns.length : 0

    // Estimer les opportunités manquées et les faux signaux
    // Ceci est une simplification - dans un système réel, il faudrait une analyse plus sophistiquée
    const missedOpportunities = Math.round(rotationSignals.length * 0.2) // Estimation: 20% d'opportunités manquées
    const falseSignals = badRotations.length

    // Estimer les contributions
    const timingContribution = goodRotations.reduce((sum, r) => sum + r.subsequentReturn1M, 0) * 0.5
    const sectorSelectionContribution = goodRotations.reduce((sum, r) => sum + r.subsequentReturn3M, 0) * 0.5

    return {
      goodRotations: goodRotations.length,
      badRotations: badRotations.length,
      missedOpportunities,
      falseSignals,
      timingContribution,
      sectorSelectionContribution,
      averageGoodRotationReturn,
      averageBadRotationReturn,
    }
  }
}

// Exporter une instance du service
export const sectorRotationBacktestService = new SectorRotationBacktestService()

// Stratégies prédéfinies pour les backtests
export const predefinedStrategies: RotationStrategyConfig[] = [
  {
    name: "Momentum 3 Mois",
    description: "Rotation basée sur le momentum des 3 derniers mois avec rééquilibrage mensuel",
    signalThreshold: 10,
    rebalancePeriod: 30,
    includeSectors: [],
    excludeSectors: [],
    useMarketTiming: false,
    riskManagement: {
      stopLoss: 15,
      maxAllocationPerSector: 100,
    },
  },
  {
    name: "Rotation Cyclique/Défensive",
    description: "Alterne entre secteurs cycliques et défensifs selon les conditions macroéconomiques",
    signalThreshold: 8,
    rebalancePeriod: 45,
    includeSectors: ["technology", "financial", "consumer", "utilities", "healthcare"],
    excludeSectors: [],
    useMarketTiming: true,
    riskManagement: {
      stopLoss: 12,
      maxAllocationPerSector: 50,
    },
  },
  {
    name: "Rotation Anti-Cyclique",
    description: "Investit dans les secteurs sous-performants pour capturer les retours à la moyenne",
    signalThreshold: 15,
    rebalancePeriod: 60,
    includeSectors: [],
    excludeSectors: ["unknown"],
    useMarketTiming: false,
    riskManagement: {
      stopLoss: 20,
      maxAllocationPerSector: 100,
    },
  },
  {
    name: "Stratégie Défensive",
    description: "Se concentre sur les secteurs défensifs avec gestion du risque stricte",
    signalThreshold: 5,
    rebalancePeriod: 30,
    includeSectors: ["utilities", "healthcare", "consumer"],
    excludeSectors: ["technology", "financial"],
    useMarketTiming: true,
    riskManagement: {
      stopLoss: 10,
      maxAllocationPerSector: 40,
    },
  },
]
