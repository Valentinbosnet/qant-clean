import type { SectorType } from "./sector-classification"
import { getSectorMacroeconomicData } from "./sector-macroeconomic-service"

/**
 * Génère un prompt spécifique au secteur pour les prédictions IA
 * @param sector Type de secteur
 * @param symbol Symbole boursier
 * @param stockName Nom de l'action
 * @param currentPrice Prix actuel
 * @returns Prompt spécifique au secteur
 */
export async function generateSectorSpecificPrompt(
  sector: SectorType,
  symbol: string,
  stockName: string,
  currentPrice: number,
): Promise<string> {
  // Récupérer les données macroéconomiques sectorielles
  const macroData = await getSectorMacroeconomicData(sector)

  // Extraire les indicateurs les plus pertinents
  const topIndicators = macroData.indicators
    .slice(0, 3)
    .map((indicator) => {
      return `- ${indicator.name}: ${indicator.value.toFixed(1)}${
        indicator.change ? ` (${indicator.change > 0 ? "+" : ""}${indicator.change.toFixed(2)})` : ""
      }, impact sur le secteur: ${indicator.sectorImpact}`
    })
    .join("\n")

  // Construire le prompt de base
  let prompt = `Analyse le titre ${symbol} (${stockName}) dans le secteur ${getSectorName(sector)} avec un prix actuel de $${currentPrice.toFixed(2)}.

Contexte macroéconomique pour le secteur ${getSectorName(sector)}:
- Perspective sectorielle: ${macroData.sectorOutlook} (force: ${(macroData.outlookStrength * 100).toFixed(0)}%)
- Indicateurs clés:
${topIndicators}
- Thèmes sectoriels: ${macroData.keyThemes.slice(0, 3).join(", ")}
- Facteurs de risque: ${macroData.riskFactors.slice(0, 2).join(", ")}

`

  // Ajouter des considérations spécifiques au secteur
  switch (sector) {
    case "technology":
      prompt += `Considérations spécifiques à la technologie:
- Évaluer l'impact des taux d'intérêt sur les valorisations technologiques
- Considérer les tendances en IA, cloud computing et cybersécurité
- Analyser les cycles d'innovation et de renouvellement des produits
- Évaluer la position concurrentielle et les barrières à l'entrée
- Considérer les risques réglementaires (antitrust, confidentialité des données)
`
      break
    case "healthcare":
      prompt += `Considérations spécifiques à la santé:
- Évaluer l'impact des politiques de santé et de la réglementation
- Considérer le vieillissement de la population et les tendances démographiques
- Analyser le pipeline de produits et les approbations réglementaires
- Évaluer les pressions sur les prix et le remboursement
- Considérer les innovations médicales et les avancées technologiques
`
      break
    case "financial":
      prompt += `Considérations spécifiques à la finance:
- Évaluer l'impact de la courbe des taux et de la politique monétaire
- Considérer la qualité des actifs et les risques de crédit
- Analyser les tendances réglementaires et les exigences de capital
- Évaluer la numérisation des services financiers et la concurrence fintech
- Considérer les risques systémiques et la stabilité financière
`
      break
    case "consumer":
      prompt += `Considérations spécifiques à la consommation:
- Évaluer l'impact de l'inflation sur le pouvoir d'achat et les marges
- Considérer les changements dans les préférences des consommateurs
- Analyser la concurrence entre commerce traditionnel et e-commerce
- Évaluer la force de la marque et la fidélité des clients
- Considérer les tendances saisonnières et les cycles économiques
`
      break
    case "industrial":
      prompt += `Considérations spécifiques à l'industrie:
- Évaluer l'impact des chaînes d'approvisionnement mondiales
- Considérer les dépenses d'infrastructure et les cycles de construction
- Analyser les coûts des intrants (matières premières, énergie, main-d'œuvre)
- Évaluer l'automatisation et les gains de productivité
- Considérer les tensions commerciales et les politiques tarifaires
`
      break
    case "energy":
      prompt += `Considérations spécifiques à l'énergie:
- Évaluer l'impact des prix du pétrole et du gaz naturel
- Considérer la transition énergétique et les énergies renouvelables
- Analyser les tensions géopolitiques et leur impact sur l'offre
- Évaluer les politiques environnementales et les réglementations
- Considérer la demande énergétique saisonnière et structurelle
`
      break
    case "utilities":
      prompt += `Considérations spécifiques aux services publics:
- Évaluer l'impact des taux d'intérêt sur ces valeurs à rendement
- Considérer la réglementation des tarifs et les rendements autorisés
- Analyser les coûts de modernisation des infrastructures
- Évaluer la transition vers les énergies renouvelables
- Considérer les conditions météorologiques et la demande saisonnière
`
      break
    case "materials":
      prompt += `Considérations spécifiques aux matériaux:
- Évaluer l'impact des prix des matières premières
- Considérer les cycles de construction et d'infrastructure
- Analyser la demande industrielle mondiale
- Évaluer les tensions commerciales et les droits de douane
- Considérer les réglementations environnementales
`
      break
    case "communication":
      prompt += `Considérations spécifiques à la communication:
- Évaluer l'impact de la transformation numérique
- Considérer les tendances en streaming et contenu
- Analyser la concurrence et la saturation du marché
- Évaluer les dépenses publicitaires et les modèles d'abonnement
- Considérer la réglementation des médias et des télécommunications
`
      break
    case "real_estate":
      prompt += `Considérations spécifiques à l'immobilier:
- Évaluer l'impact des taux d'intérêt et des taux hypothécaires
- Considérer les tendances démographiques et migratoires
- Analyser l'offre et la demande sur les marchés clés
- Évaluer l'impact du travail à distance sur l'immobilier commercial
- Considérer les coûts de construction et les contraintes d'offre
`
      break
    default:
      prompt += `Considérations générales:
- Évaluer l'impact des conditions macroéconomiques
- Considérer les tendances sectorielles et la position concurrentielle
- Analyser les fondamentaux financiers et les perspectives de croissance
- Évaluer les risques spécifiques à l'entreprise et au secteur
- Considérer le sentiment du marché et les facteurs techniques
`
  }

  // Ajouter les instructions pour le format de réponse
  prompt += `
Génère une prédiction détaillée pour ${symbol} en tenant compte de ces facteurs sectoriels et macroéconomiques. Fournis une analyse approfondie et des prévisions de prix à court et long terme.

Réponds au format JSON suivant:
{
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "Explication détaillée de la prédiction",
  "catalysts": ["Liste des catalyseurs potentiels"],
  "risks": ["Liste des risques potentiels"],
  "sectorSpecificInsights": "Analyse spécifique au secteur",
  "dailyPredictions": [
    {"date": "YYYY-MM-DD", "price": number}
  ]
}
`

  return prompt
}

/**
 * Obtient le nom lisible d'un secteur
 */
function getSectorName(sector: SectorType): string {
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
