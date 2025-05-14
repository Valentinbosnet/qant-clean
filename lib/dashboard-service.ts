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
  name: string
  widgets: WidgetConfig[]
  isDefault: boolean
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
    return getLocalDashboardLayout()
  }

  // Si l'utilisateur est connecté, récupérer depuis Supabase
  try {
    const supabase = createClientComponentClient()

    // Récupérer le layout par défaut de l'utilisateur
    const { data, error } = await supabase
      .from("dashboard_layouts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()

    if (error && !error.message.includes("No rows found")) {
      throw error
    }

    // Si un layout par défaut existe, le retourner
    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        widgets: data.layout.widgets || [],
        isDefault: data.is_default,
        lastUpdated: data.last_updated,
      }
    }

    // Si aucun layout par défaut n'existe, vérifier s'il y a d'autres layouts
    const { data: anyLayout, error: anyError } = await supabase
      .from("dashboard_layouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!anyError && anyLayout) {
      // Définir ce layout comme layout par défaut
      await supabase.from("dashboard_layouts").update({ is_default: true }).eq("id", anyLayout.id)

      return {
        id: anyLayout.id,
        userId: anyLayout.user_id,
        name: anyLayout.name,
        widgets: anyLayout.layout.widgets || [],
        isDefault: true,
        lastUpdated: anyLayout.last_updated,
      }
    }

    // Si aucun layout n'existe, créer un layout par défaut
    return createDefaultDashboardLayout(user)
  } catch (error) {
    console.error("Erreur lors de la récupération du layout:", error)
    // En cas d'erreur, utiliser un layout par défaut depuis le stockage local
    return getLocalDashboardLayout()
  }
}

// Fonction pour obtenir le layout local
function getLocalDashboardLayout(): DashboardLayout {
  if (typeof window === "undefined") {
    return {
      id: "local",
      userId: "offline",
      name: "Layout local",
      widgets: DEFAULT_WIDGETS,
      isDefault: true,
      lastUpdated: new Date().toISOString(),
    }
  }

  try {
    const storedLayout = localStorage.getItem(DASHBOARD_LAYOUT_KEY)
    if (storedLayout) {
      return JSON.parse(storedLayout)
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du layout local:", error)
  }

  // Layout par défaut
  const defaultLayout: DashboardLayout = {
    id: "local",
    userId: "offline",
    name: "Layout local",
    widgets: DEFAULT_WIDGETS,
    isDefault: true,
    lastUpdated: new Date().toISOString(),
  }

  // Sauvegarder dans le stockage local
  try {
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(defaultLayout))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du layout local:", error)
  }

  return defaultLayout
}

// Fonction pour créer un layout par défaut
async function createDefaultDashboardLayout(user: any): Promise<DashboardLayout> {
  const defaultLayout: DashboardLayout = {
    id: uuidv4(),
    userId: user.id,
    name: "Layout par défaut",
    widgets: DEFAULT_WIDGETS,
    isDefault: true,
    lastUpdated: new Date().toISOString(),
  }

  try {
    const supabase = createClientComponentClient()

    // Insérer le layout par défaut
    const { error } = await supabase.from("dashboard_layouts").insert({
      id: defaultLayout.id,
      user_id: defaultLayout.userId,
      name: defaultLayout.name,
      layout: { widgets: defaultLayout.widgets },
      is_default: defaultLayout.isDefault,
      last_updated: defaultLayout.lastUpdated,
    })

    if (error) {
      throw error
    }

    return defaultLayout
  } catch (error) {
    console.error("Erreur lors de la création du layout par défaut:", error)
    return defaultLayout // Retourner quand même le layout par défaut
  }
}

// Fonction pour sauvegarder le layout du tableau de bord
export async function saveDashboardLayout(user: any, layout: DashboardLayout): Promise<boolean> {
  // Mettre à jour la date de dernière modification
  layout.lastUpdated = new Date().toISOString()

  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, utiliser le stockage local
  if (!user || isOfflineModeEnabled()) {
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(layout))
      return true
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du layout local:", error)
      return false
    }
  }

  // Si l'utilisateur est connecté, sauvegarder dans Supabase
  try {
    const supabase = createClientComponentClient()

    // Mettre à jour le layout
    const { error } = await supabase
      .from("dashboard_layouts")
      .update({
        name: layout.name,
        layout: { widgets: layout.widgets },
        is_default: layout.isDefault,
        last_updated: layout.lastUpdated,
      })
      .eq("id", layout.id)

    if (error) throw error

    // Sauvegarder également dans le stockage local pour la résilience
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(layout))
    } catch (localError) {
      console.warn("Impossible de sauvegarder le layout en local:", localError)
    }

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
    // Si l'utilisateur n'est pas connecté ou en mode hors ligne
    if (!user || isOfflineModeEnabled()) {
      const defaultLayout: DashboardLayout = {
        id: "local",
        userId: "offline",
        name: "Layout local",
        widgets: DEFAULT_WIDGETS,
        isDefault: true,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(defaultLayout))
      return true
    }

    // Si l'utilisateur est connecté
    const supabase = createClientComponentClient()

    // Récupérer le layout par défaut actuel
    const { data, error } = await supabase
      .from("dashboard_layouts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()

    if (!error && data) {
      // Mettre à jour le layout existant
      const { error: updateError } = await supabase
        .from("dashboard_layouts")
        .update({
          layout: { widgets: DEFAULT_WIDGETS },
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id)

      if (updateError) throw updateError
    } else {
      // Créer un nouveau layout par défaut
      await createDefaultDashboardLayout(user)
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du tableau de bord:", error)
    return false
  }
}

// Fonction pour obtenir tous les layouts d'un utilisateur
export async function getUserDashboardLayouts(user: any): Promise<DashboardLayout[]> {
  if (!user || isOfflineModeEnabled()) {
    const localLayout = getLocalDashboardLayout()
    return [localLayout]
  }

  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from("dashboard_layouts")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      const defaultLayout = await createDefaultDashboardLayout(user)
      return [defaultLayout]
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      widgets: item.layout.widgets || [],
      isDefault: item.is_default,
      lastUpdated: item.last_updated,
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des layouts:", error)
    return [getLocalDashboardLayout()]
  }
}

// Fonction pour créer un nouveau layout
export async function createDashboardLayout(
  user: any,
  name: string,
  widgets: WidgetConfig[] = DEFAULT_WIDGETS,
  isDefault = false,
): Promise<DashboardLayout | null> {
  if (!user || isOfflineModeEnabled()) {
    return null // Création de nouveaux layouts non supportée en mode hors ligne
  }

  try {
    const supabase = createClientComponentClient()
    const newLayout: DashboardLayout = {
      id: uuidv4(),
      userId: user.id,
      name,
      widgets,
      isDefault,
      lastUpdated: new Date().toISOString(),
    }

    // Si ce layout doit être le layout par défaut, désactiver les autres layouts par défaut
    if (isDefault) {
      await supabase
        .from("dashboard_layouts")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true)
    }

    // Insérer le nouveau layout
    const { error } = await supabase.from("dashboard_layouts").insert({
      id: newLayout.id,
      user_id: newLayout.userId,
      name: newLayout.name,
      layout: { widgets: newLayout.widgets },
      is_default: newLayout.isDefault,
      last_updated: newLayout.lastUpdated,
    })

    if (error) throw error

    return newLayout
  } catch (error) {
    console.error("Erreur lors de la création du layout:", error)
    return null
  }
}

// Fonction pour supprimer un layout
export async function deleteDashboardLayout(user: any, layoutId: string): Promise<boolean> {
  if (!user || isOfflineModeEnabled()) {
    return false // Suppression de layouts non supportée en mode hors ligne
  }

  try {
    const supabase = createClientComponentClient()

    // Vérifier si c'est le layout par défaut
    const { data, error: checkError } = await supabase
      .from("dashboard_layouts")
      .select("is_default")
      .eq("id", layoutId)
      .single()

    if (checkError) throw checkError

    // Ne pas permettre la suppression du layout par défaut s'il n'y a pas d'autre layout
    if (data.is_default) {
      const { count, error: countError } = await supabase
        .from("dashboard_layouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (countError) throw countError

      if (count <= 1) {
        throw new Error("Impossible de supprimer le seul layout disponible")
      }
    }

    // Supprimer le layout
    const { error } = await supabase.from("dashboard_layouts").delete().eq("id", layoutId)

    if (error) throw error

    // Si c'était le layout par défaut, définir un autre layout comme layout par défaut
    if (data.is_default) {
      const { data: otherLayout, error: otherError } = await supabase
        .from("dashboard_layouts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (otherError) throw otherError

      await supabase.from("dashboard_layouts").update({ is_default: true }).eq("id", otherLayout.id)
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du layout:", error)
    return false
  }
}

// Fonction pour définir un layout comme layout par défaut
export async function setDefaultDashboardLayout(user: any, layoutId: string): Promise<boolean> {
  if (!user || isOfflineModeEnabled()) {
    return false // Modification du layout par défaut non supportée en mode hors ligne
  }

  try {
    const supabase = createClientComponentClient()

    // Désactiver tous les layouts par défaut
    await supabase.from("dashboard_layouts").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true)

    // Définir le nouveau layout par défaut
    const { error } = await supabase.from("dashboard_layouts").update({ is_default: true }).eq("id", layoutId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Erreur lors de la définition du layout par défaut:", error)
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
