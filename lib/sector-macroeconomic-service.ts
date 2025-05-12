import { getFromCache, saveToCache } from "./cache-utils"
import type { SectorType } from "./sector-classification"
import { getMacroeconomicData, type MacroeconomicIndicator } from "./macroeconomic-service"

// Durée du cache pour les données macroéconomiques sectorielles (6 heures)
const SECTOR_MACRO_CACHE_DURATION = 6 * 60 * 60 * 1000

/**
 * Interface pour un indicateur macroéconomique sectoriel
 */
export interface SectorMacroIndicator extends MacroeconomicIndicator {
  relevance: number // Pertinence pour le secteur (0-1)
  sectorImpact: "positive" | "negative" | "neutral" // Impact spécifique sur le secteur
  description: string // Description de l'impact sur le secteur
}

/**
 * Interface pour les données macroéconomiques sectorielles
 */
export interface SectorMacroeconomicData {
  sector: SectorType
  indicators: SectorMacroIndicator[]
  lastUpdated: string
  sectorOutlook: "bullish" | "bearish" | "neutral"
  outlookStrength: number // 0-1, force de la conviction
  keyThemes: string[] // Thèmes clés pour ce secteur
  riskFactors: string[] // Facteurs de risque macroéconomiques
}

/**
 * Définition des indicateurs pertinents par secteur
 * Chaque secteur a une liste d'indicateurs avec leur pertinence (0-1)
 */
const sectorIndicatorRelevance: Record<SectorType, Record<string, number>> = {
  technology: {
    "Taux directeur": 0.9,
    "Croissance du PIB": 0.7,
    "Dépenses de consommation": 0.8,
    "Investissements des entreprises": 0.9,
    "Taux de chômage": 0.5,
    "Taux d'inflation": 0.7,
    "Indice de confiance des consommateurs": 0.8,
    "Rendement des obligations d'État à 10 ans": 0.9,
  },
  healthcare: {
    "Dépenses de santé": 0.95,
    "Taux d'inflation": 0.6,
    "Croissance du PIB": 0.5,
    "Taux de chômage": 0.4,
    "Vieillissement de la population": 0.9,
    "Politiques de santé publique": 0.95,
    "Taux directeur": 0.6,
    "Dépenses gouvernementales": 0.8,
  },
  financial: {
    "Taux directeur": 0.95,
    "Courbe des taux": 0.9,
    "Taux d'inflation": 0.9,
    "Croissance du PIB": 0.8,
    "Taux de chômage": 0.7,
    "Déficit budgétaire": 0.8,
    "Dette publique": 0.8,
    "Rendement des obligations d'État à 10 ans": 0.9,
    "Indice de confiance des consommateurs": 0.7,
  },
  consumer: {
    "Dépenses de consommation": 0.95,
    "Taux de chômage": 0.9,
    "Revenu disponible": 0.9,
    "Taux d'inflation": 0.8,
    "Indice de confiance des consommateurs": 0.95,
    "Taux directeur": 0.7,
    "Croissance du PIB": 0.7,
    "Prix de l'énergie": 0.6,
  },
  industrial: {
    "Production industrielle": 0.95,
    "Commandes de biens durables": 0.9,
    "Investissements des entreprises": 0.9,
    "Croissance du PIB": 0.8,
    "Prix des matières premières": 0.8,
    "Taux de change": 0.7,
    "Taux directeur": 0.7,
    "Commerce international": 0.9,
  },
  energy: {
    "Prix du pétrole brut": 0.95,
    "Prix du gaz naturel": 0.9,
    "Demande énergétique mondiale": 0.9,
    "Politiques environnementales": 0.8,
    "Taux de change": 0.6,
    "Croissance du PIB": 0.7,
    "Production industrielle": 0.8,
    "Tensions géopolitiques": 0.9,
  },
  utilities: {
    "Taux directeur": 0.9,
    "Rendement des obligations d'État à 10 ans": 0.9,
    "Taux d'inflation": 0.8,
    "Prix de l'énergie": 0.9,
    "Politiques environnementales": 0.8,
    "Croissance démographique": 0.7,
    "Conditions météorologiques": 0.8,
    "Dépenses d'infrastructure": 0.8,
  },
  materials: {
    "Prix des matières premières": 0.95,
    "Production industrielle": 0.9,
    "Construction résidentielle": 0.8,
    "Dépenses d'infrastructure": 0.9,
    "Croissance du PIB": 0.8,
    "Commerce international": 0.8,
    "Taux de change": 0.7,
    "Politiques environnementales": 0.7,
  },
  communication: {
    "Dépenses de consommation": 0.8,
    "Dépenses publicitaires": 0.9,
    "Taux directeur": 0.7,
    "Croissance du PIB": 0.7,
    "Indice de confiance des consommateurs": 0.8,
    "Investissements des entreprises": 0.8,
    "Politiques réglementaires": 0.9,
    "Taux de pénétration numérique": 0.9,
  },
  real_estate: {
    "Taux directeur": 0.95,
    "Taux hypothécaires": 0.95,
    "Construction résidentielle": 0.9,
    "Taux de chômage": 0.8,
    "Croissance démographique": 0.8,
    "Revenu disponible": 0.8,
    "Taux d'inflation": 0.7,
    "Politiques de logement": 0.9,
  },
  unknown: {
    "Taux directeur": 0.8,
    "Croissance du PIB": 0.8,
    "Taux d'inflation": 0.8,
    "Taux de chômage": 0.7,
    "Indice de confiance des consommateurs": 0.7,
    "Rendement des obligations d'État à 10 ans": 0.7,
  },
}

/**
 * Thèmes clés par secteur
 */
const sectorKeyThemes: Record<SectorType, string[]> = {
  technology: [
    "Innovation et R&D",
    "Transformation numérique",
    "Intelligence artificielle",
    "Cybersécurité",
    "Cloud computing",
  ],
  healthcare: [
    "Vieillissement de la population",
    "Innovation médicale",
    "Politiques de santé",
    "Télémédecine",
    "Biotechnologie",
  ],
  financial: [
    "Politique monétaire",
    "Réglementation bancaire",
    "Fintech",
    "Gestion de patrimoine",
    "Crédit à la consommation",
  ],
  consumer: [
    "Comportement des consommateurs",
    "E-commerce",
    "Inflation des prix alimentaires",
    "Expérience client",
    "Durabilité",
  ],
  industrial: [
    "Chaînes d'approvisionnement",
    "Automatisation",
    "Infrastructures",
    "Commerce mondial",
    "Efficacité énergétique",
  ],
  energy: [
    "Transition énergétique",
    "Énergies renouvelables",
    "Géopolitique pétrolière",
    "Demande énergétique",
    "Réglementation environnementale",
  ],
  utilities: [
    "Réglementation des services publics",
    "Modernisation des infrastructures",
    "Énergies renouvelables",
    "Efficacité énergétique",
    "Croissance démographique",
  ],
  materials: [
    "Chaînes d'approvisionnement mondiales",
    "Construction et infrastructure",
    "Durabilité et recyclage",
    "Demande industrielle",
    "Innovation des matériaux",
  ],
  communication: [
    "Transformation numérique",
    "Streaming et contenu",
    "5G et connectivité",
    "Réglementation des médias",
    "Publicité numérique",
  ],
  real_estate: [
    "Taux d'intérêt et financement",
    "Urbanisation",
    "Travail à distance",
    "Développement durable",
    "Démographie et migration",
  ],
  unknown: [
    "Conditions économiques générales",
    "Politique monétaire",
    "Tendances de consommation",
    "Environnement réglementaire",
  ],
}

/**
 * Facteurs de risque macroéconomiques par secteur
 */
const sectorRiskFactors: Record<SectorType, string[]> = {
  technology: [
    "Hausse des taux d'intérêt impactant les valorisations",
    "Réglementation accrue des grandes technologies",
    "Pénuries de semi-conducteurs",
    "Tensions géopolitiques affectant les chaînes d'approvisionnement",
    "Ralentissement des dépenses informatiques des entreprises",
  ],
  healthcare: [
    "Réformes de la politique de santé",
    "Pression sur les prix des médicaments",
    "Concurrence des génériques",
    "Litiges et responsabilité des produits",
    "Échecs dans le développement de médicaments",
  ],
  financial: [
    "Inversion de la courbe des taux",
    "Détérioration de la qualité du crédit",
    "Réglementation bancaire plus stricte",
    "Instabilité des marchés financiers",
    "Risques systémiques",
  ],
  consumer: [
    "Inflation persistante érodant le pouvoir d'achat",
    "Hausse du chômage",
    "Changement dans les préférences des consommateurs",
    "Perturbations de la chaîne d'approvisionnement",
    "Concurrence accrue du e-commerce",
  ],
  industrial: [
    "Perturbations de la chaîne d'approvisionnement mondiale",
    "Hausse des coûts des intrants",
    "Ralentissement économique mondial",
    "Tensions commerciales internationales",
    "Pénuries de main-d'œuvre qualifiée",
  ],
  energy: [
    "Volatilité des prix du pétrole et du gaz",
    "Politiques climatiques strictes",
    "Transition vers les énergies renouvelables",
    "Instabilité géopolitique dans les régions productrices",
    "Baisse de la demande due à l'efficacité énergétique",
  ],
  utilities: [
    "Hausse des taux d'intérêt",
    "Réglementation environnementale stricte",
    "Coûts de modernisation des infrastructures",
    "Événements météorologiques extrêmes",
    "Concurrence des solutions énergétiques décentralisées",
  ],
  materials: [
    "Volatilité des prix des matières premières",
    "Ralentissement de la construction",
    "Réglementation environnementale",
    "Tensions commerciales mondiales",
    "Substitution par des matériaux alternatifs",
  ],
  communication: [
    "Saturation du marché",
    "Coûts élevés d'acquisition de contenu",
    "Réglementation des médias et de la confidentialité",
    "Concurrence technologique",
    "Évolution rapide des préférences des consommateurs",
  ],
  real_estate: [
    "Hausse des taux d'intérêt",
    "Surabondance de l'offre sur certains marchés",
    "Changements dans les préférences de travail (télétravail)",
    "Ralentissement économique affectant la demande",
    "Réglementation du logement",
  ],
  unknown: [
    "Incertitude économique générale",
    "Volatilité des marchés financiers",
    "Changements réglementaires",
    "Perturbations sectorielles",
  ],
}

/**
 * Récupère les données macroéconomiques spécifiques à un secteur
 * @param sector Type de secteur
 * @param country Pays (par défaut: US)
 * @param forceRefresh Forcer le rafraîchissement des données
 * @returns Données macroéconomiques sectorielles
 */
export async function getSectorMacroeconomicData(
  sector: SectorType,
  country = "US",
  forceRefresh = false,
): Promise<SectorMacroeconomicData> {
  const cacheKey = `sector_macro_${sector}_${country}`

  // Vérifier le cache d'abord si on ne force pas le rafraîchissement
  if (!forceRefresh) {
    const cachedData = getFromCache<SectorMacroeconomicData>(cacheKey)
    if (cachedData) {
      return cachedData
    }
  }

  try {
    // Récupérer les données macroéconomiques générales
    const macroData = await getMacroeconomicData(country, forceRefresh)

    // Filtrer et enrichir les indicateurs pertinents pour ce secteur
    const relevantIndicators: SectorMacroIndicator[] = []

    // Récupérer les indicateurs pertinents pour ce secteur
    const sectorRelevance = sectorIndicatorRelevance[sector] || sectorIndicatorRelevance.unknown

    // Traiter chaque indicateur macroéconomique
    for (const indicator of macroData.indicators) {
      // Vérifier si cet indicateur est pertinent pour ce secteur
      const relevance = sectorRelevance[indicator.name] || 0.3

      // Si l'indicateur est suffisamment pertinent, l'inclure
      if (relevance > 0.3) {
        // Déterminer l'impact sectoriel spécifique
        // Cela pourrait être plus sophistiqué dans une implémentation réelle
        let sectorImpact: "positive" | "negative" | "neutral" = indicator.impact

        // Certains indicateurs ont des impacts différents selon les secteurs
        if (indicator.name === "Taux directeur") {
          // Hausse des taux: négatif pour technologie, immobilier, services publics
          // Positif pour finance dans certaines conditions
          if (indicator.change && indicator.change > 0) {
            if (sector === "financial") {
              sectorImpact = "positive"
            } else if (["technology", "real_estate", "utilities"].includes(sector)) {
              sectorImpact = "negative"
            }
          }
        } else if (indicator.name === "Taux d'inflation") {
          // Inflation élevée: négatif pour consommation, positif pour matériaux et énergie
          if (indicator.value > 3.0) {
            if (["materials", "energy"].includes(sector)) {
              sectorImpact = "positive"
            } else if (["consumer", "technology"].includes(sector)) {
              sectorImpact = "negative"
            }
          }
        }

        // Générer une description de l'impact
        const description = generateImpactDescription(indicator.name, sectorImpact, sector, indicator)

        // Ajouter l'indicateur enrichi
        relevantIndicators.push({
          ...indicator,
          relevance,
          sectorImpact,
          description,
        })
      }
    }

    // Trier les indicateurs par pertinence
    relevantIndicators.sort((a, b) => b.relevance - a.relevance)

    // Déterminer l'orientation sectorielle
    // Pondérer l'impact de chaque indicateur par sa pertinence
    let outlookScore = 0
    let totalWeight = 0

    for (const indicator of relevantIndicators) {
      const weight = indicator.relevance
      const impactScore = indicator.sectorImpact === "positive" ? 1 : indicator.sectorImpact === "negative" ? -1 : 0
      outlookScore += weight * impactScore
      totalWeight += weight
    }

    // Normaliser le score
    outlookScore = totalWeight > 0 ? outlookScore / totalWeight : 0

    // Déterminer l'orientation et sa force
    let sectorOutlook: "bullish" | "bearish" | "neutral" = "neutral"
    if (outlookScore > 0.2) {
      sectorOutlook = "bullish"
    } else if (outlookScore < -0.2) {
      sectorOutlook = "bearish"
    }

    const outlookStrength = Math.min(1, Math.abs(outlookScore) * 1.5)

    // Construire le résultat final
    const result: SectorMacroeconomicData = {
      sector,
      indicators: relevantIndicators,
      lastUpdated: new Date().toISOString(),
      sectorOutlook,
      outlookStrength,
      keyThemes: sectorKeyThemes[sector] || sectorKeyThemes.unknown,
      riskFactors: sectorRiskFactors[sector] || sectorRiskFactors.unknown,
    }

    // Sauvegarder dans le cache
    saveToCache<SectorMacroeconomicData>(cacheKey, result, SECTOR_MACRO_CACHE_DURATION)

    return result
  } catch (error) {
    console.error(`Erreur lors de la récupération des données macroéconomiques sectorielles:`, error)

    // En cas d'erreur, retourner des données par défaut
    return {
      sector,
      indicators: [],
      lastUpdated: new Date().toISOString(),
      sectorOutlook: "neutral",
      outlookStrength: 0.5,
      keyThemes: sectorKeyThemes[sector] || sectorKeyThemes.unknown,
      riskFactors: sectorRiskFactors[sector] || sectorRiskFactors.unknown,
    }
  }
}

/**
 * Génère une description de l'impact d'un indicateur sur un secteur
 */
function generateImpactDescription(
  indicatorName: string,
  impact: "positive" | "negative" | "neutral",
  sector: SectorType,
  indicator: MacroeconomicIndicator,
): string {
  // Descriptions spécifiques pour certaines combinaisons d'indicateurs et de secteurs
  const specificDescriptions: Record<
    string,
    Record<SectorType, Record<"positive" | "negative" | "neutral", string>>
  > = {
    "Taux directeur": {
      technology: {
        positive: "La stabilisation des taux favorise les investissements en R&D.",
        negative:
          "La hausse des taux réduit les valorisations des entreprises technologiques et augmente le coût du capital pour l'innovation.",
        neutral: "L'impact actuel des taux sur le secteur technologique reste modéré.",
      },
      financial: {
        positive: "La hausse des taux améliore les marges d'intérêt nettes des banques.",
        negative: "La baisse des taux comprime les marges des institutions financières.",
        neutral: "Les taux actuels maintiennent un équilibre pour les activités financières.",
      },
      real_estate: {
        positive: "La baisse des taux stimule la demande immobilière et réduit les coûts de financement.",
        negative: "La hausse des taux augmente les coûts hypothécaires et réduit l'accessibilité.",
        neutral: "Les taux actuels n'ont pas d'impact significatif sur le marché immobilier.",
      },
      // Valeurs par défaut pour les autres secteurs
      healthcare: {
        positive: "L'environnement de taux favorise les investissements dans le secteur de la santé.",
        negative: "La hausse des taux augmente les coûts de financement pour les entreprises de santé.",
        neutral: "L'impact des taux sur le secteur de la santé reste limité.",
      },
      consumer: {
        positive: "Les taux actuels soutiennent le pouvoir d'achat des consommateurs.",
        negative: "La hausse des taux réduit le pouvoir d'achat et augmente les coûts du crédit à la consommation.",
        neutral: "Les taux n'ont pas d'impact significatif sur les dépenses de consommation actuellement.",
      },
      industrial: {
        positive: "Les conditions de taux favorisent les investissements industriels.",
        negative: "La hausse des taux augmente les coûts de financement des projets industriels.",
        neutral: "L'impact des taux sur le secteur industriel reste modéré.",
      },
      energy: {
        positive: "Les conditions de taux soutiennent les investissements dans les infrastructures énergétiques.",
        negative: "La hausse des taux augmente les coûts des projets énergétiques à forte intensité de capital.",
        neutral: "L'impact des taux sur le secteur énergétique reste limité.",
      },
      utilities: {
        positive: "Les taux favorables réduisent les coûts de financement des infrastructures.",
        negative: "La hausse des taux augmente les coûts de la dette pour ce secteur à forte intensité de capital.",
        neutral: "L'impact des taux sur les services publics reste modéré.",
      },
      materials: {
        positive:
          "Les conditions de taux soutiennent les investissements dans les projets d'extraction et de production.",
        negative: "La hausse des taux augmente les coûts des projets à forte intensité de capital.",
        neutral: "L'impact des taux sur le secteur des matériaux reste limité.",
      },
      communication: {
        positive: "Les taux favorables soutiennent les investissements dans les infrastructures de communication.",
        negative: "La hausse des taux augmente les coûts de financement des infrastructures de communication.",
        neutral: "L'impact des taux sur le secteur de la communication reste modéré.",
      },
      unknown: {
        positive: "Les conditions de taux actuelles sont généralement favorables.",
        negative: "La situation des taux présente des défis pour ce secteur.",
        neutral: "L'impact des taux reste modéré pour ce secteur.",
      },
    },
    "Taux d'inflation": {
      consumer: {
        positive: "L'inflation modérée stimule les achats anticipés.",
        negative: "L'inflation élevée érode le pouvoir d'achat des consommateurs et comprime les marges.",
        neutral: "L'inflation actuelle n'a pas d'impact significatif sur le comportement des consommateurs.",
      },
      energy: {
        positive: "L'inflation soutient les prix de l'énergie et améliore les marges.",
        negative: "L'inflation augmente les coûts opérationnels sans compensation par les prix.",
        neutral: "L'impact de l'inflation sur le secteur énergétique reste équilibré.",
      },
      // Autres secteurs...
      technology: {
        positive: "L'inflation modérée permet d'augmenter les prix des produits et services technologiques.",
        negative: "L'inflation élevée augmente les coûts de production et de main-d'œuvre.",
        neutral: "L'impact de l'inflation sur le secteur technologique reste limité.",
      },
      healthcare: {
        positive: "L'inflation permet d'ajuster les prix des services de santé à la hausse.",
        negative: "L'inflation augmente les coûts opérationnels et des fournitures médicales.",
        neutral: "L'impact de l'inflation sur le secteur de la santé reste modéré.",
      },
      financial: {
        positive: "L'inflation modérée peut augmenter les revenus d'intérêts nominaux.",
        negative: "L'inflation élevée érode la valeur des actifs à revenu fixe et provoque des hausses de taux.",
        neutral: "L'inflation actuelle a un impact équilibré sur le secteur financier.",
      },
      industrial: {
        positive: "L'inflation permet de répercuter les hausses de coûts sur les prix.",
        negative: "L'inflation augmente les coûts des matières premières et de la main-d'œuvre.",
        neutral: "L'impact de l'inflation sur le secteur industriel reste modéré.",
      },
      utilities: {
        positive: "L'inflation permet d'ajuster les tarifs réglementés à la hausse.",
        negative: "L'inflation augmente les coûts opérationnels sans ajustement immédiat des tarifs.",
        neutral: "L'impact de l'inflation sur les services publics reste limité par la réglementation.",
      },
      materials: {
        positive: "L'inflation soutient les prix des matières premières et améliore les marges.",
        negative: "L'inflation augmente les coûts opérationnels sans compensation par les prix.",
        neutral: "L'impact de l'inflation sur le secteur des matériaux reste équilibré.",
      },
      communication: {
        positive: "L'inflation permet d'ajuster les prix des services à la hausse.",
        negative: "L'inflation augmente les coûts opérationnels et de main-d'œuvre.",
        neutral: "L'impact de l'inflation sur le secteur de la communication reste modéré.",
      },
      real_estate: {
        positive: "L'inflation modérée valorise les actifs immobiliers comme couverture.",
        negative: "L'inflation élevée provoque des hausses de taux qui pénalisent l'immobilier.",
        neutral: "L'impact de l'inflation sur le secteur immobilier reste équilibré.",
      },
      unknown: {
        positive: "L'inflation actuelle présente certains avantages pour ce secteur.",
        negative: "L'inflation pose des défis pour ce secteur.",
        neutral: "L'impact de l'inflation reste modéré pour ce secteur.",
      },
    },
    // Autres indicateurs...
  }

  // Vérifier si nous avons une description spécifique
  if (
    specificDescriptions[indicatorName] &&
    specificDescriptions[indicatorName][sector] &&
    specificDescriptions[indicatorName][sector][impact]
  ) {
    return specificDescriptions[indicatorName][sector][impact]
  }

  // Sinon, générer une description générique
  let description = ""
  const value = indicator.value
  const change = indicator.change || 0
  const direction = change > 0 ? "en hausse" : change < 0 ? "en baisse" : "stable"

  switch (impact) {
    case "positive":
      description = `${indicatorName} (${value.toFixed(1)}, ${direction}) a un impact positif sur le secteur ${getSectorName(sector).toLowerCase()}.`
      break
    case "negative":
      description = `${indicatorName} (${value.toFixed(1)}, ${direction}) présente un défi pour le secteur ${getSectorName(sector).toLowerCase()}.`
      break
    default:
      description = `${indicatorName} (${value.toFixed(1)}, ${direction}) a un impact limité sur le secteur ${getSectorName(sector).toLowerCase()}.`
  }

  return description
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
