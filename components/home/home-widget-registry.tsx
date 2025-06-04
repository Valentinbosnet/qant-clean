import {
  DynamicWelcomeWidget,
  DynamicQuickActionsWidget,
  DynamicFavoritesWidget,
  DynamicMarketOverviewWidget,
  DynamicRecentActivityWidget,
  DynamicNewsWidget,
  DynamicPerformanceWidget,
  DynamicFeaturesWidget,
  DynamicStockHighlightsWidget,
  DynamicPredictionInsightsWidget,
} from "./dynamic-widget-loader"

// Registre des widgets disponibles
const widgetRegistry = {
  welcome: DynamicWelcomeWidget,
  "quick-actions": DynamicQuickActionsWidget,
  favorites: DynamicFavoritesWidget,
  "market-overview": DynamicMarketOverviewWidget,
  "recent-activity": DynamicRecentActivityWidget,
  news: DynamicNewsWidget,
  performance: DynamicPerformanceWidget,
  features: DynamicFeaturesWidget,
  "stock-highlights": DynamicStockHighlightsWidget,
  "prediction-insights": DynamicPredictionInsightsWidget,
  stock: DynamicStockHighlightsWidget, // Fallback
}

export default widgetRegistry
