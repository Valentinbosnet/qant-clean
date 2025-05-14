"use client"

import { v4 as uuidv4 } from "uuid"
import { isOfflineModeEnabled } from "@/lib/offline-mode"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Types pour le tableau de bord
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
  type: string
  title: string
  position: WidgetPosition
  settings: any
  visible: boolean
}

export interface DashboardLayout {
  id: string
  userId: string
  widgets: WidgetConfig[]
  lastUpdated: string
}

export interface DashboardSettings {
  columns: number
  rowHeight: number
  compactType: "vertical" | "horizontal" | null
  preventCollision: boolean
  showWidgetBorders: boolean
  allowOverlap: boolean
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  columns: 12,
  rowHeight: 50,
  compactType: "vertical",
  preventCollision: false,
  showWidgetBorders: true,
  allowOverlap: false,
}

// Clés de stockage local
const DASHBOARD_LAYOUT_KEY = "dashboard_layout"
const DASHBOARD_SETTINGS_KEY = "dashboard_settings"

// Widgets par défaut
const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: uuidv4(),
    type: "market",
    title: "Aperçu du marché",
    position: { i: "market", x: 0, y: 0, w: 6, h: 4 },
    settings: {
      displayCount: 5,
    },
    visible: true,
  },
  {
    id: uuidv4(),
    type: "favorites",
    title: "Mes favoris",
    position: { i: "favorites", x: 6, y: 0, w: 6, h: 4 },
    settings: {
      displayCount: 5,
    },
    visible: true,
  },
  {
    id: uuidv4(),
    type: "prediction",
    title: "Prédictions",
    position: { i: "prediction", x: 0, y: 4, w: 6, h: 4 },
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
    position: { i: "news", x: 6, y: 4, w: 6, h: 4 },
    settings: {
      maxItems: 5,
      defaultCategory: "all",
    },
    visible: true,
  },
]

// Fonction pour obtenir le layout du tableau de bord
export async function getDashboardLayout(user: any): Promise<DashboardLayout> {
  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, utiliser le stockage local
  if (!user || isOfflineModeEnabled()) {
    const storedLayout = localStorage.getItem(DASHBOARD_LAYOUT_KEY)
    if (storedLayout) {
      return JSON.parse(storedLayout)
    }

    // Créer un layout par défaut
    const defaultLayout: DashboardLayout = {
      id: uuidv4(),
      userId: user?.id || "offline",
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder dans le stockage local
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(defaultLayout))
    return defaultLayout
  }

  // Si l'utilisateur est connecté, récupérer depuis Supabase
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from("dashboard_layouts").select("*").eq("user_id", user.id).single()

    if (error) throw error

    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        widgets: data.widgets,
        lastUpdated: data.last_updated,
      }
    }

    // Si aucun layout n'existe, créer un layout par défaut
    const defaultLayout: DashboardLayout = {
      id: uuidv4(),
      userId: user.id,
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder dans Supabase
    const { error: insertError } = await supabase.from("dashboard_layouts").insert({
      id: defaultLayout.id,
      user_id: defaultLayout.userId,
      widgets: defaultLayout.widgets,
      last_updated: defaultLayout.lastUpdated,
    })

    if (insertError) throw insertError

    return defaultLayout
  } catch (error) {
    console.error("Erreur lors de la récupération du layout:", error)
    // En cas d'erreur, utiliser un layout par défaut
    return {
      id: uuidv4(),
      userId: user?.id || "offline",
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    }
  }
}

// Fonction pour sauvegarder le layout du tableau de bord
export async function saveDashboardLayout(user: any, layout: DashboardLayout): Promise<boolean> {
  // Mettre à jour la date de dernière modification
  layout.lastUpdated = new Date().toISOString()

  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, utiliser le stockage local
  if (!user || isOfflineModeEnabled()) {
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(layout))
    return true
  }

  // Si l'utilisateur est connecté, sauvegarder dans Supabase
  try {
    const supabase = createClientComponentClient()
    const { error } = await supabase
      .from("dashboard_layouts")
      .update({
        widgets: layout.widgets,
        last_updated: layout.lastUpdated,
      })
      .eq("id", layout.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du layout:", error)
    return false
  }
}

// Fonction pour mettre à jour un widget
export async function updateWidget(user: any, widgetId: string, updates: Partial<WidgetConfig>): Promise<boolean> {
  try {
    // Récupérer le layout actuel
    const layout = await getDashboardLayout(user)

    // Trouver et mettre à jour le widget
    const updatedWidgets = layout.widgets.map((widget) => (widget.id === widgetId ? { ...widget, ...updates } : widget))

    // Mettre à jour le layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder le layout mis à jour
    return await saveDashboardLayout(user, updatedLayout)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du widget:", error)
    return false
  }
}

// Fonction pour ajouter un widget
export async function addWidget(user: any, type: string, title: string, settings: any = {}): Promise<boolean> {
  try {
    // Récupérer le layout actuel
    const layout = await getDashboardLayout(user)

    // Créer un nouvel ID pour le widget
    const widgetId = uuidv4()

    // Créer le nouveau widget
    const newWidget: WidgetConfig = {
      id: widgetId,
      type,
      title,
      position: {
        i: widgetId,
        x: 0,
        y: 0, // Sera placé en haut du layout
        w: 6, // Largeur par défaut
        h: 4, // Hauteur par défaut
      },
      settings,
      visible: true,
    }

    // Ajouter le widget au layout
    const updatedLayout = {
      ...layout,
      widgets: [...layout.widgets, newWidget],
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder le layout mis à jour
    return await saveDashboardLayout(user, updatedLayout)
  } catch (error) {
    console.error("Erreur lors de l'ajout du widget:", error)
    return false
  }
}

// Fonction pour supprimer un widget
export async function removeWidget(user: any, widgetId: string): Promise<boolean> {
  try {
    // Récupérer le layout actuel
    const layout = await getDashboardLayout(user)

    // Filtrer pour supprimer le widget
    const updatedWidgets = layout.widgets.filter((widget) => widget.id !== widgetId)

    // Mettre à jour le layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder le layout mis à jour
    return await saveDashboardLayout(user, updatedLayout)
  } catch (error) {
    console.error("Erreur lors de la suppression du widget:", error)
    return false
  }
}

// Fonction pour mettre à jour les positions des widgets
export async function updateLayout(user: any, positions: WidgetPosition[]): Promise<boolean> {
  try {
    // Récupérer le layout actuel
    const layout = await getDashboardLayout(user)

    // Mettre à jour les positions des widgets
    const updatedWidgets = layout.widgets.map((widget) => {
      const newPosition = positions.find((pos) => pos.i === widget.position.i)
      if (newPosition) {
        return {
          ...widget,
          position: newPosition,
        }
      }
      return widget
    })

    // Mettre à jour le layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder le layout mis à jour
    return await saveDashboardLayout(user, updatedLayout)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du layout:", error)
    return false
  }
}

// Fonction pour réinitialiser le tableau de bord
export async function resetDashboard(user: any): Promise<boolean> {
  try {
    // Créer un layout par défaut
    const defaultLayout: DashboardLayout = {
      id: user?.id ? uuidv4() : "offline",
      userId: user?.id || "offline",
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    }

    // Sauvegarder le layout par défaut
    return await saveDashboardLayout(user, defaultLayout)
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du tableau de bord:", error)
    return false
  }
}

// Fonction pour obtenir les paramètres du tableau de bord
export function getDashboardSettings(): DashboardSettings {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD_SETTINGS

  const storedSettings = localStorage.getItem(DASHBOARD_SETTINGS_KEY)
  if (storedSettings) {
    return JSON.parse(storedSettings)
  }

  return DEFAULT_DASHBOARD_SETTINGS
}

// Fonction pour sauvegarder les paramètres du tableau de bord
export function saveDashboardSettings(settings: DashboardSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify(settings))
}
