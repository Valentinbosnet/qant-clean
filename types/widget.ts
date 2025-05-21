// Types pour le système de widgets

export type WidgetType =
  | "welcome"
  | "market-overview"
  | "news"
  | "favorites"
  | "performance"
  | "stock"
  | "quick-actions"
  | "sector-overview"

export type WidgetCategory = "all" | "market" | "personal" | "analytics"

export interface WidgetDefinition {
  type: WidgetType
  title: string
  description: string
  icon: string
  category: WidgetCategory
  defaultSettings: Record<string, any>
  sizeDefaults: {
    minW: number
    minH: number
    defaultW: number
    defaultH: number
    maxW: number
    maxH: number
  }
}

export interface WidgetPosition {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  position: WidgetPosition
  visible: boolean
  settings?: Record<string, any>
}

export interface DashboardLayout {
  id: string
  userId: string
  widgets: WidgetConfig[]
  lastUpdated: string
}

export type ResizePreset = "small" | "medium" | "large" | "full" | "auto"

export type ResizeHandle = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne"

export type CompactType = "vertical" | "horizontal" | null

export interface HomeWidgetConfig {
  id: string
  type: string
  title?: string
  settings?: {
    [key: string]: any
    indices?: string[]
  }
  position?: {
    x: number
    y: number
    w: number
    h: number
  }
}
