export interface WidgetConfig {
  id: string
  type: string
  settings: Record<string, any>
}

export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
}

export interface DashboardConfig {
  widgets: WidgetConfig[]
  layout: LayoutItem[]
}

export interface DashboardPreferences {
  id?: string
  user_id: string
  config: DashboardConfig
  created_at?: string
  updated_at?: string
}
