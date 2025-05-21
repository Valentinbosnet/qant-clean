// This is a simplified version of the widget registry
const widgetRegistry: Record<string, any> = {
  welcome: () => <div className="p-4">Welcome Widget</div>,
  "market-overview": () => <div className="p-4">Market Overview Widget</div>,
  news: () => <div className="p-4">News Widget</div>,
  favorites: () => <div className="p-4">Favorites Widget</div>,
  performance: () => <div className="p-4">Performance Widget</div>,
  stock: () => <div className="p-4">Stock Widget</div>,
}

export default widgetRegistry
