import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { RotationBacktestResult, RotationBacktestEvent } from "./sector-rotation-backtest-service"

/**
 * Convertit les résultats de backtest en format CSV
 */
export function convertBacktestResultToCSV(result: RotationBacktestResult): string {
  // Entête du CSV
  let csv = "Date,Performance,Benchmark\n"

  // Ajouter les données de performance
  result.dates.forEach((date, index) => {
    csv += `${date},${result.performance[index].toFixed(2)},${result.benchmarkPerformance[index].toFixed(2)}\n`
  })

  return csv
}

/**
 * Convertit les métriques de performance en format CSV
 */
export function convertMetricsToCSV(result: RotationBacktestResult): string {
  let csv = "Métrique,Valeur\n"

  // Métriques globales
  csv += `Rendement total,${result.totalReturn.toFixed(2)}%\n`
  csv += `Rendement annualisé,${result.annualizedReturn.toFixed(2)}%\n`
  csv += `Drawdown maximal,${result.maxDrawdown.toFixed(2)}%\n`
  csv += `Ratio de Sharpe,${result.sharpeRatio.toFixed(2)}\n`
  csv += `Volatilité,${result.volatility.toFixed(2)}%\n`
  csv += `Alpha,${result.alpha.toFixed(2)}%\n`
  csv += `Beta,${result.beta.toFixed(2)}\n`

  // Métriques de risque avancées
  csv += `Ratio de Sortino,${result.riskMetrics.sortinoRatio.toFixed(2)}\n`
  csv += `Ratio d'Information,${result.riskMetrics.informationRatio.toFixed(2)}\n`
  csv += `Tracking Error,${result.riskMetrics.trackingError.toFixed(2)}%\n`
  csv += `Ratio de Calmar,${result.riskMetrics.calmarRatio.toFixed(2)}\n`
  csv += `VaR (95%),${result.riskMetrics.var95.toFixed(2)}%\n`
  csv += `Expected Shortfall,${result.riskMetrics.expectedShortfall.toFixed(2)}%\n`

  // Attribution de performance
  csv += `Contribution de la sélection de secteur,${result.performanceAttribution.sectorSelection.toFixed(2)}%\n`
  csv += `Contribution du market timing,${result.performanceAttribution.marketTiming.toFixed(2)}%\n`
  csv += `Contribution de l'allocation sectorielle,${result.performanceAttribution.sectorAllocation.toFixed(2)}%\n`
  csv += `Autres facteurs,${result.performanceAttribution.other.toFixed(2)}%\n`

  return csv
}

/**
 * Convertit les rotations en format CSV
 */
export function convertRotationsToCSV(rotations: RotationBacktestEvent[]): string {
  if (rotations.length === 0) return "Aucune rotation"

  let csv = "Date,De,Vers,Raison,Force du signal,Retour 1M,Retour 3M,Retour 6M,Succès\n"

  rotations.forEach((rotation) => {
    csv += `${rotation.date},${rotation.fromSectorName},${rotation.toSectorName},${rotation.reason},${rotation.signalStrength.toFixed(
      2,
    )}%,${rotation.subsequentReturn1M.toFixed(2)}%,${rotation.subsequentReturn3M.toFixed(2)}%,${rotation.subsequentReturn6M.toFixed(
      2,
    )}%,${rotation.success ? "Oui" : "Non"}\n`
  })

  return csv
}

/**
 * Convertit l'attribution par secteur en format CSV
 */
export function convertSectorAttributionToCSV(result: RotationBacktestResult): string {
  if (result.sectorAttribution.length === 0) return "Aucune attribution par secteur"

  let csv = "Secteur,Jours détenus,% du temps,Contribution,% de la perf.,Rendement moyen\n"

  result.sectorAttribution.forEach((sector) => {
    csv += `${sector.sectorName},${sector.daysHeld},${sector.percentageTimeHeld.toFixed(1)}%,${sector.contribution.toFixed(
      2,
    )}%,${sector.contributionPercentage.toFixed(1)}%,${sector.averageReturn.toFixed(2)}%\n`
  })

  return csv
}

/**
 * Exporte les résultats de backtest en CSV
 */
export function exportBacktestResultToCSV(result: RotationBacktestResult, filename = "backtest-result"): void {
  // Créer un objet Blob avec le contenu CSV
  const performanceCSV = convertBacktestResultToCSV(result)
  const metricsCSV = convertMetricsToCSV(result)
  const rotationsCSV = convertRotationsToCSV(result.rotations)
  const sectorAttributionCSV = convertSectorAttributionToCSV(result)

  // Combiner tous les CSV avec des séparateurs
  const fullCSV = `PERFORMANCE QUOTIDIENNE\n${performanceCSV}\n\nMÉTRIQUES\n${metricsCSV}\n\nROTATIONS\n${rotationsCSV}\n\nATTRIBUTION PAR SECTEUR\n${sectorAttributionCSV}`

  const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })

  // Créer un lien de téléchargement
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporte les résultats de backtest en PDF
 */
export function exportBacktestResultToPDF(result: RotationBacktestResult, filename = "backtest-result"): void {
  // Créer un nouveau document PDF
  const doc = new jsPDF()

  // Ajouter un titre
  doc.setFontSize(18)
  doc.text(`Rapport de Backtest: ${result.name}`, 14, 22)
  doc.setFontSize(12)
  doc.text(`Période: ${result.dates[0]} - ${result.dates[result.dates.length - 1]}`, 14, 30)
  doc.text(`Description: ${result.description}`, 14, 38)

  // Ajouter les métriques principales
  doc.setFontSize(14)
  doc.text("Métriques de Performance", 14, 50)

  autoTable(doc, {
    startY: 55,
    head: [["Métrique", "Valeur"]],
    body: [
      ["Rendement total", `${result.totalReturn.toFixed(2)}%`],
      ["Rendement annualisé", `${result.annualizedReturn.toFixed(2)}%`],
      ["Drawdown maximal", `${result.maxDrawdown.toFixed(2)}%`],
      ["Ratio de Sharpe", result.sharpeRatio.toFixed(2)],
      ["Volatilité", `${result.volatility.toFixed(2)}%`],
      ["Alpha", `${result.alpha.toFixed(2)}%`],
      ["Beta", result.beta.toFixed(2)],
    ],
  })

  // Ajouter les métriques de risque avancées
  doc.setFontSize(14)
  doc.text("Métriques de Risque Avancées", 14, doc.lastAutoTable.finalY + 10)

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Métrique", "Valeur"]],
    body: [
      ["Ratio de Sortino", result.riskMetrics.sortinoRatio.toFixed(2)],
      ["Ratio d'Information", result.riskMetrics.informationRatio.toFixed(2)],
      ["Tracking Error", `${result.riskMetrics.trackingError.toFixed(2)}%`],
      ["Ratio de Calmar", result.riskMetrics.calmarRatio.toFixed(2)],
      ["VaR (95%)", `${result.riskMetrics.var95.toFixed(2)}%`],
      ["Expected Shortfall", `${result.riskMetrics.expectedShortfall.toFixed(2)}%`],
    ],
  })

  // Ajouter l'attribution de performance
  doc.setFontSize(14)
  doc.text("Attribution de Performance", 14, doc.lastAutoTable.finalY + 10)

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Source", "Contribution"]],
    body: [
      ["Sélection de secteur", `${result.performanceAttribution.sectorSelection.toFixed(2)}%`],
      ["Market timing", `${result.performanceAttribution.marketTiming.toFixed(2)}%`],
      ["Allocation sectorielle", `${result.performanceAttribution.sectorAllocation.toFixed(2)}%`],
      ["Autres facteurs", `${result.performanceAttribution.other.toFixed(2)}%`],
      ["Total", `${result.performanceAttribution.total.toFixed(2)}%`],
    ],
  })

  // Ajouter les rotations (nouvelle page)
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Rotations", 14, 20)

  if (result.rotations.length > 0) {
    const rotationsData = result.rotations.map((rotation) => [
      rotation.date,
      rotation.fromSectorName,
      rotation.toSectorName,
      `${rotation.signalStrength.toFixed(2)}%`,
      `${rotation.subsequentReturn3M.toFixed(2)}%`,
      rotation.success ? "Oui" : "Non",
    ])

    autoTable(doc, {
      startY: 25,
      head: [["Date", "De", "Vers", "Force", "Retour 3M", "Succès"]],
      body: rotationsData,
    })
  } else {
    doc.setFontSize(12)
    doc.text("Aucune rotation effectuée", 14, 30)
  }

  // Ajouter l'attribution par secteur
  doc.setFontSize(14)
  doc.text("Attribution par Secteur", 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 50)

  if (result.sectorAttribution.length > 0) {
    const sectorData = result.sectorAttribution
      .slice(0, 10) // Top 10 secteurs
      .map((sector) => [
        sector.sectorName,
        `${sector.percentageTimeHeld.toFixed(1)}%`,
        `${sector.contribution.toFixed(2)}%`,
        `${sector.averageReturn.toFixed(2)}%`,
      ])

    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 55,
      head: [["Secteur", "% du temps", "Contribution", "Rendement moyen"]],
      body: sectorData,
    })
  } else {
    doc.setFontSize(12)
    doc.text("Aucune attribution par secteur disponible", 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 55)
  }

  // Ajouter les drawdowns
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Analyse des Drawdowns", 14, 20)

  if (result.drawdownAnalysis.drawdowns.length > 0) {
    const drawdownData = result.drawdownAnalysis.drawdowns
      .slice(0, 10) // Top 10 drawdowns
      .map((drawdown) => [
        new Date(drawdown.startDate).toLocaleDateString(),
        new Date(drawdown.endDate).toLocaleDateString(),
        drawdown.recoveryDate ? new Date(drawdown.recoveryDate).toLocaleDateString() : "Non récupéré",
        `${drawdown.depth.toFixed(2)}%`,
        drawdown.duration.toString(),
        drawdown.sectorAtStart,
      ])

    autoTable(doc, {
      startY: 25,
      head: [["Début", "Fin", "Récupération", "Profondeur", "Durée (j)", "Secteur"]],
      body: drawdownData,
    })
  } else {
    doc.setFontSize(12)
    doc.text("Aucun drawdown significatif", 14, 30)
  }

  // Ajouter un pied de page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      {
        align: "center",
      },
    )
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 10)
  }

  // Sauvegarder le PDF
  doc.save(`${filename}.pdf`)
}

/**
 * Exporte les résultats de comparaison de stratégies en CSV
 */
export function exportComparisonToCSV(results: RotationBacktestResult[], filename = "strategies-comparison"): void {
  // Entête du CSV
  let csv = "Stratégie,Rendement total,Rendement annualisé,Drawdown maximal,Ratio de Sharpe,Volatilité,Alpha,Beta\n"

  // Ajouter les données pour chaque stratégie
  results.forEach((result) => {
    csv += `${result.name},${result.totalReturn.toFixed(2)}%,${result.annualizedReturn.toFixed(2)}%,${result.maxDrawdown.toFixed(
      2,
    )}%,${result.sharpeRatio.toFixed(2)},${result.volatility.toFixed(2)}%,${result.alpha.toFixed(2)}%,${result.beta.toFixed(
      2,
    )}\n`
  })

  // Créer un objet Blob avec le contenu CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

  // Créer un lien de téléchargement
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporte les résultats de comparaison de stratégies en PDF
 */
export function exportComparisonToPDF(results: RotationBacktestResult[], filename = "strategies-comparison"): void {
  // Créer un nouveau document PDF
  const doc = new jsPDF()

  // Ajouter un titre
  doc.setFontSize(18)
  doc.text("Comparaison des Stratégies de Rotation Sectorielle", 14, 22)
  doc.setFontSize(12)

  if (results.length > 0) {
    doc.text(`Période: ${results[0].dates[0]} - ${results[0].dates[results[0].dates.length - 1]}`, 14, 30)
  }

  // Tableau de comparaison des stratégies
  doc.setFontSize(14)
  doc.text("Métriques de Performance", 14, 40)

  const comparisonData = results.map((result) => [
    result.name,
    `${result.totalReturn.toFixed(2)}%`,
    `${result.annualizedReturn.toFixed(2)}%`,
    `${result.maxDrawdown.toFixed(2)}%`,
    result.sharpeRatio.toFixed(2),
    `${result.volatility.toFixed(2)}%`,
    `${result.alpha.toFixed(2)}%`,
    result.beta.toFixed(2),
  ])

  autoTable(doc, {
    startY: 45,
    head: [["Stratégie", "Rdt. total", "Rdt. annualisé", "Drawdown max", "Sharpe", "Volatilité", "Alpha", "Beta"]],
    body: comparisonData,
  })

  // Ajouter les métriques de risque avancées
  doc.setFontSize(14)
  doc.text("Métriques de Risque Avancées", 14, doc.lastAutoTable.finalY + 10)

  const riskData = results.map((result) => [
    result.name,
    result.riskMetrics.sortinoRatio.toFixed(2),
    result.riskMetrics.informationRatio.toFixed(2),
    `${result.riskMetrics.trackingError.toFixed(2)}%`,
    result.riskMetrics.calmarRatio.toFixed(2),
    `${result.riskMetrics.var95.toFixed(2)}%`,
  ])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Stratégie", "Sortino", "Information", "Tracking Error", "Calmar", "VaR (95%)"]],
    body: riskData,
  })

  // Ajouter l'attribution de performance pour chaque stratégie
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Attribution de Performance par Stratégie", 14, 20)

  const attributionData = results.map((result) => [
    result.name,
    `${result.performanceAttribution.sectorSelection.toFixed(2)}%`,
    `${result.performanceAttribution.marketTiming.toFixed(2)}%`,
    `${result.performanceAttribution.sectorAllocation.toFixed(2)}%`,
    `${result.performanceAttribution.other.toFixed(2)}%`,
    `${result.performanceAttribution.total.toFixed(2)}%`,
  ])

  autoTable(doc, {
    startY: 25,
    head: [["Stratégie", "Sélection", "Timing", "Allocation", "Autres", "Total"]],
    body: attributionData,
  })

  // Ajouter un pied de page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      {
        align: "center",
      },
    )
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 10)
  }

  // Sauvegarder le PDF
  doc.save(`${filename}.pdf`)
}
