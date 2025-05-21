import dynamic from "next/dynamic"

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

// Lazy load widget components with loading states
const DynamicWelcomeWidget = dynamic(() => import("./widgets/welcome-widget").then((mod) => mod.default || mod), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const DynamicQuickActionsWidget = dynamic(
  () => import("./widgets/quick-actions-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

const DynamicFavoritesWidget = dynamic(() => import("./widgets/favorites-widget").then((mod) => mod.default || mod), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const DynamicMarketOverviewWidget = dynamic(
  () => import("./widgets/market-overview-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

const DynamicRecentActivityWidget = dynamic(
  () => import("./widgets/recent-activity-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

const DynamicNewsWidget = dynamic(() => import("./widgets/news-widget").then((mod) => mod.default || mod), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const DynamicPerformanceWidget = dynamic(
  () => import("./widgets/performance-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

const DynamicFeaturesWidget = dynamic(() => import("./widgets/features-widget").then((mod) => mod.default || mod), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
})

const DynamicStockHighlightsWidget = dynamic(
  () => import("./widgets/stock-highlights-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

const DynamicPredictionInsightsWidget = dynamic(
  () => import("./widgets/prediction-insights-widget").then((mod) => mod.default || mod),
  {
    loading: () => <WidgetSkeleton />,
    ssr: false,
  },
)

// Registre des widgets disponibles
const widgetRegistry: Record<string, any> = {
  welcome: DynamicWelcomeWidget,
  "quick-actions": () => <div className="p-4">Quick Actions Widget</div>,
  favorites: DynamicFavoritesWidget,
  "market-overview": DynamicMarketOverviewWidget,
  "recent-activity": () => <div className="p-4">Recent Activity Widget</div>,
  news: DynamicNewsWidget,
  performance: DynamicPerformanceWidget,
  features: () => <div className="p-4">Features Widget</div>,
  "stock-highlights": () => <div className="p-4">Stock Highlights Widget</div>,
  "prediction-insights": () => <div className="p-4">Prediction Insights Widget</div>,
  stock: () => <div className="p-4">Stock Widget</div>,
}

export default widgetRegistry
