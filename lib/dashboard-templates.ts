import { v4 as uuidv4 } from "uuid"
import type { WidgetConfig } from "./dashboard-service"

// Types pour les modèles de tableau de bord
export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: "beginner" | "intermediate" | "advanced" | "specialized"
  thumbnail: string
  widgets: WidgetConfig[]
}

// Modèle pour débutants
const beginnerTemplate: DashboardTemplate = {
  id: "template-beginner",
  name: "Débutant",
  description: "Configuration simple avec les widgets essentiels pour commencer à suivre le marché",
  category: "beginner",
  thumbnail: "/placeholder.svg?key=gf7sm",
  widgets: [
    {
      id: uuidv4(),
      type: "market",
      title: "Aperçu du marché",
      position: { i: "market-overview", x: 0, y: 0, w: 12, h: 4 },
      settings: {
        displayCount: 5,
        showChart: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "favorites",
      title: "Mes favoris",
      position: { i: "favorites", x: 0, y: 4, w: 6, h: 6 },
      settings: {
        displayCount: 5,
        showPrice: true,
        showChange: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "news",
      title: "Actualités financières",
      position: { i: "news", x: 6, y: 4, w: 6, h: 6 },
      settings: {
        maxItems: 5,
        defaultCategory: "general",
      },
      visible: true,
    },
  ],
}

// Modèle intermédiaire
const intermediateTemplate: DashboardTemplate = {
  id: "template-intermediate",
  name: "Intermédiaire",
  description: "Configuration équilibrée avec des widgets pour suivre et analyser le marché",
  category: "intermediate",
  thumbnail: "/placeholder.svg?key=yjhaa",
  widgets: [
    {
      id: uuidv4(),
      type: "market",
      title: "Aperçu du marché",
      position: { i: "market-overview", x: 0, y: 0, w: 6, h: 4 },
      settings: {
        displayCount: 5,
        showChart: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "sector",
      title: "Performance des secteurs",
      position: { i: "sector", x: 6, y: 0, w: 6, h: 4 },
      settings: {
        period: "1d",
        sortBy: "performance",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "favorites",
      title: "Mes favoris",
      position: { i: "favorites", x: 0, y: 4, w: 4, h: 6 },
      settings: {
        displayCount: 5,
        showPrice: true,
        showChange: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "prediction",
      title: "Prédictions",
      position: { i: "prediction", x: 4, y: 4, w: 4, h: 6 },
      settings: {
        symbol: "AAPL",
        timeframe: "7d",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "news",
      title: "Actualités financières",
      position: { i: "news", x: 8, y: 4, w: 4, h: 6 },
      settings: {
        maxItems: 5,
        defaultCategory: "markets",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "notes",
      title: "Mes notes",
      position: { i: "notes", x: 0, y: 10, w: 12, h: 4 },
      settings: {
        maxItems: 5,
        showDate: true,
      },
      visible: true,
    },
  ],
}

// Modèle avancé
const advancedTemplate: DashboardTemplate = {
  id: "template-advanced",
  name: "Avancé",
  description: "Configuration complète avec des widgets avancés pour les traders expérimentés",
  category: "advanced",
  thumbnail: "/placeholder.svg?key=hfx75",
  widgets: [
    {
      id: uuidv4(),
      type: "market",
      title: "Aperçu du marché",
      position: { i: "market-overview", x: 0, y: 0, w: 4, h: 4 },
      settings: {
        displayCount: 5,
        showChart: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "sector",
      title: "Performance des secteurs",
      position: { i: "sector", x: 4, y: 0, w: 4, h: 4 },
      settings: {
        period: "1d",
        sortBy: "performance",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "alerts",
      title: "Alertes",
      position: { i: "alerts", x: 8, y: 0, w: 4, h: 4 },
      settings: {
        showUnreadOnly: true,
        maxItems: 5,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "favorites",
      title: "Mes favoris",
      position: { i: "favorites", x: 0, y: 4, w: 3, h: 6 },
      settings: {
        displayCount: 5,
        showPrice: true,
        showChange: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "stock",
      title: "AAPL",
      position: { i: "stock-aapl", x: 3, y: 4, w: 3, h: 6 },
      settings: {
        symbol: "AAPL",
        showVolume: true,
        showIndicators: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "prediction",
      title: "Prédictions",
      position: { i: "prediction", x: 6, y: 4, w: 3, h: 6 },
      settings: {
        symbol: "AAPL",
        timeframe: "7d",
        showConfidence: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "news",
      title: "Actualités financières",
      position: { i: "news", x: 9, y: 4, w: 3, h: 6 },
      settings: {
        maxItems: 5,
        defaultCategory: "markets",
        showImpact: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "performance",
      title: "Performance des prédictions",
      position: { i: "performance", x: 0, y: 10, w: 6, h: 4 },
      settings: {
        period: "30d",
        showAccuracy: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "notes",
      title: "Mes notes",
      position: { i: "notes", x: 6, y: 10, w: 6, h: 4 },
      settings: {
        maxItems: 5,
        showDate: true,
        showSymbols: true,
      },
      visible: true,
    },
  ],
}

// Modèle d'analyse technique
const technicalAnalysisTemplate: DashboardTemplate = {
  id: "template-technical",
  name: "Analyse technique",
  description: "Configuration spécialisée pour l'analyse technique avec indicateurs et graphiques",
  category: "specialized",
  thumbnail: "/placeholder.svg?key=fwtqx",
  widgets: [
    {
      id: uuidv4(),
      type: "stock",
      title: "AAPL - Analyse technique",
      position: { i: "stock-aapl", x: 0, y: 0, w: 8, h: 6 },
      settings: {
        symbol: "AAPL",
        showVolume: true,
        showIndicators: true,
        indicators: ["sma", "ema", "rsi", "macd"],
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "sector",
      title: "Performance des secteurs",
      position: { i: "sector", x: 8, y: 0, w: 4, h: 6 },
      settings: {
        period: "1d",
        sortBy: "performance",
        showVolume: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "stock",
      title: "MSFT - Analyse technique",
      position: { i: "stock-msft", x: 0, y: 6, w: 6, h: 6 },
      settings: {
        symbol: "MSFT",
        showVolume: true,
        showIndicators: true,
        indicators: ["sma", "ema", "rsi", "macd"],
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "stock",
      title: "GOOGL - Analyse technique",
      position: { i: "stock-googl", x: 6, y: 6, w: 6, h: 6 },
      settings: {
        symbol: "GOOGL",
        showVolume: true,
        showIndicators: true,
        indicators: ["sma", "ema", "rsi", "macd"],
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "alerts",
      title: "Alertes techniques",
      position: { i: "alerts", x: 0, y: 12, w: 6, h: 4 },
      settings: {
        showUnreadOnly: true,
        maxItems: 5,
        filterByType: "technical",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "notes",
      title: "Notes d'analyse",
      position: { i: "notes", x: 6, y: 12, w: 6, h: 4 },
      settings: {
        maxItems: 5,
        showDate: true,
        showSymbols: true,
      },
      visible: true,
    },
  ],
}

// Modèle d'analyse fondamentale
const fundamentalAnalysisTemplate: DashboardTemplate = {
  id: "template-fundamental",
  name: "Analyse fondamentale",
  description: "Configuration spécialisée pour l'analyse fondamentale des entreprises",
  category: "specialized",
  thumbnail: "/placeholder.svg?key=wi63s",
  widgets: [
    {
      id: uuidv4(),
      type: "stock",
      title: "AAPL - Fondamentaux",
      position: { i: "stock-aapl", x: 0, y: 0, w: 6, h: 6 },
      settings: {
        symbol: "AAPL",
        showFundamentals: true,
        metrics: ["pe", "eps", "dividend", "marketCap"],
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "news",
      title: "Actualités AAPL",
      position: { i: "news-aapl", x: 6, y: 0, w: 6, h: 6 },
      settings: {
        maxItems: 5,
        symbol: "AAPL",
        showImpact: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "sector",
      title: "Comparaison sectorielle",
      position: { i: "sector", x: 0, y: 6, w: 12, h: 4 },
      settings: {
        period: "1m",
        sortBy: "performance",
        showFundamentals: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "prediction",
      title: "Prédictions à long terme",
      position: { i: "prediction", x: 0, y: 10, w: 6, h: 6 },
      settings: {
        symbol: "AAPL",
        timeframe: "30d",
        showConfidence: true,
        includeFundamentals: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "notes",
      title: "Notes d'analyse fondamentale",
      position: { i: "notes", x: 6, y: 10, w: 6, h: 6 },
      settings: {
        maxItems: 5,
        showDate: true,
        showSymbols: true,
      },
      visible: true,
    },
  ],
}

// Modèle de suivi de portefeuille
const portfolioTrackingTemplate: DashboardTemplate = {
  id: "template-portfolio",
  name: "Suivi de portefeuille",
  description: "Configuration pour suivre et analyser la performance de votre portefeuille",
  category: "specialized",
  thumbnail: "/placeholder.svg?height=100&width=200&query=portfolio%20tracking%20dashboard",
  widgets: [
    {
      id: uuidv4(),
      type: "favorites",
      title: "Mon portefeuille",
      position: { i: "portfolio", x: 0, y: 0, w: 8, h: 6 },
      settings: {
        displayCount: 10,
        showPrice: true,
        showChange: true,
        showAllocation: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "performance",
      title: "Performance du portefeuille",
      position: { i: "portfolio-performance", x: 8, y: 0, w: 4, h: 6 },
      settings: {
        period: "1y",
        showBenchmark: true,
        benchmark: "SPY",
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "sector",
      title: "Allocation sectorielle",
      position: { i: "sector-allocation", x: 0, y: 6, w: 6, h: 6 },
      settings: {
        showAllocation: true,
        showPerformance: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "alerts",
      title: "Alertes de portefeuille",
      position: { i: "portfolio-alerts", x: 6, y: 6, w: 6, h: 6 },
      settings: {
        showUnreadOnly: true,
        maxItems: 5,
        filterByPortfolio: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "news",
      title: "Actualités du portefeuille",
      position: { i: "portfolio-news", x: 0, y: 12, w: 6, h: 4 },
      settings: {
        maxItems: 5,
        filterByPortfolio: true,
      },
      visible: true,
    },
    {
      id: uuidv4(),
      type: "notes",
      title: "Notes de portefeuille",
      position: { i: "notes", x: 6, y: 12, w: 6, h: 4 },
      settings: {
        maxItems: 5,
        showDate: true,
        showSymbols: true,
      },
      visible: true,
    },
  ],
}

// Liste de tous les modèles disponibles
export const dashboardTemplates: DashboardTemplate[] = [
  beginnerTemplate,
  intermediateTemplate,
  advancedTemplate,
  technicalAnalysisTemplate,
  fundamentalAnalysisTemplate,
  portfolioTrackingTemplate,
]

// Fonction pour obtenir tous les modèles
export function getAllTemplates(): DashboardTemplate[] {
  return dashboardTemplates
}

// Fonction pour obtenir un modèle par ID
export function getTemplateById(templateId: string): DashboardTemplate | undefined {
  return dashboardTemplates.find((template) => template.id === templateId)
}

// Fonction pour obtenir les modèles par catégorie
export function getTemplatesByCategory(category: string): DashboardTemplate[] {
  return dashboardTemplates.filter((template) => template.category === category)
}
