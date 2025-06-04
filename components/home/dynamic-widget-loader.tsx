"use client"

import dynamic from "next/dynamic"
import { WidgetSkeleton } from "./widget-skeleton"

// Lazy load widget components with loading states and ssr: false
export const DynamicWelcomeWidget = dynamic(() => import("./widgets/welcome-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicQuickActionsWidget = dynamic(() => import("./widgets/quick-actions-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicFavoritesWidget = dynamic(() => import("./widgets/favorites-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicMarketOverviewWidget = dynamic(() => import("./widgets/market-overview-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicRecentActivityWidget = dynamic(() => import("./widgets/recent-activity-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicNewsWidget = dynamic(() => import("./widgets/news-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicPerformanceWidget = dynamic(() => import("./widgets/performance-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicFeaturesWidget = dynamic(() => import("./widgets/features-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicStockHighlightsWidget = dynamic(() => import("./widgets/stock-highlights-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

export const DynamicPredictionInsightsWidget = dynamic(() => import("./widgets/prediction-insights-widget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})
