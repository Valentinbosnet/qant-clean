"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { LineChart, PieChart, TrendingUp, Star, Bell, FileText, Newspaper } from "lucide-react"

// Lazy load widget components
const PredictionWidget = dynamic(() => import("./widgets/prediction-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const FavoritesWidget = dynamic(() => import("./widgets/favorites-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const MarketOverviewWidget = dynamic(() => import("./widgets/market-overview-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const AlertsWidget = dynamic(() => import("./widgets/alerts-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const NotesWidget = dynamic(() => import("./widgets/notes-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const SectorWidget = dynamic(() => import("./widgets/sector-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const NewsWidget = dynamic(() => import("./widgets/news-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

// Widget skeleton loader component
function WidgetSkeleton() {
  return (
    <div className="w-full h-full min-h-[100px] animate-pulse">
      <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
        <div className="h-3 bg-muted rounded w-4/6"></div>
      </div>
    </div>
  )
}

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
