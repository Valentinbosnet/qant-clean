"use client"

import type React from "react"

import { PredictionWidget } from "./widgets/prediction-widget"
import { FavoritesWidget } from "./widgets/favorites-widget"
import { MarketOverviewWidget } from "./widgets/market-overview-widget"
import { AlertsWidget } from "./widgets/alerts-widget"
import { NotesWidget } from "./widgets/notes-widget"
import { SectorWidget } from "./widgets/sector-widget"
import { NewsWidget } from "./widgets/news-widget"
import { LineChart, PieChart, TrendingUp, Star, Bell, FileText, Newspaper } from "lucide-react"

export type WidgetType = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  component: React.ComponentType<any>
  defaultWidth: number
  defaultHeight: number
  minWidth?: number
  minHeight?: number
  defaultSettings?: Record<string, any>
}

export const WIDGET_TYPES: Record<string, WidgetType> = {
  prediction: {
    id: "prediction",
    name: "Prédictions",
    description: "Affiche les prédictions pour un symbole boursier",
    icon: TrendingUp,
    component: PredictionWidget,
    defaultWidth: 4,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      symbol: "AAPL",
      showChart: true,
      predictionMode: "lightweight",
    },
  },
  favorites: {
    id: "favorites",
    name: "Favoris",
    description: "Affiche vos actions favorites",
    icon: Star,
    component: FavoritesWidget,
    defaultWidth: 4,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      maxItems: 5,
      showPrediction: true,
    },
  },
  marketOverview: {
    id: "marketOverview",
    name: "Aperçu du marché",
    description: "Affiche un aperçu des principaux indices du marché",
    icon: LineChart,
    component: MarketOverviewWidget,
    defaultWidth: 4,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      indices: ["SPY", "QQQ", "DIA"],
      timeRange: "1d",
    },
  },
  alerts: {
    id: "alerts",
    name: "Alertes",
    description: "Affiche vos alertes récentes",
    icon: Bell,
    component: AlertsWidget,
    defaultWidth: 3,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      maxItems: 5,
      showAll: false,
    },
  },
  notes: {
    id: "notes",
    name: "Notes",
    description: "Affiche vos notes personnelles",
    icon: FileText,
    component: NotesWidget,
    defaultWidth: 3,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      maxItems: 3,
      showContent: true,
    },
  },
  sector: {
    id: "sector",
    name: "Secteurs",
    description: "Affiche la performance des secteurs",
    icon: PieChart,
    component: SectorWidget,
    defaultWidth: 4,
    defaultHeight: 3,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      displayType: "chart",
      timeRange: "1m",
    },
  },
  news: {
    id: "news",
    name: "Actualités",
    description: "Affiche les dernières actualités financières",
    icon: Newspaper,
    component: NewsWidget,
    defaultWidth: 4,
    defaultHeight: 2,
    minWidth: 2,
    minHeight: 2,
    defaultSettings: {
      maxItems: 5,
      categories: ["general", "business"],
    },
  },
}

export function getWidgetComponent(widgetType: string) {
  return WIDGET_TYPES[widgetType]?.component || null
}

export function getWidgetDefaultSettings(widgetType: string) {
  return WIDGET_TYPES[widgetType]?.defaultSettings || {}
}

export function getWidgetDefaultSize(widgetType: string) {
  const widget = WIDGET_TYPES[widgetType]
  if (!widget) return { w: 3, h: 2 }
  return { w: widget.defaultWidth, h: widget.defaultHeight }
}

export function getAvailableWidgets() {
  return Object.values(WIDGET_TYPES)
}
