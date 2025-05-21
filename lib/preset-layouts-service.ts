"use client"

import { v4 as uuidv4 } from "uuid"
import { isOfflineModeEnabled } from "@/lib/offline-mode"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { WidgetConfig, DashboardLayout } from "@/lib/dashboard-service"

// Types pour les layouts prédéfinis
export interface PresetLayout {
  id: string
  name: string
  description: string
  category: "simple" | "analytics" | "monitoring" | "custom"
  thumbnail: string
  widgets: WidgetConfig[]
  createdBy?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// Clé de stockage local
const PRESET_LAYOUTS_KEY = "preset_layouts"

// Layouts prédéfinis par défaut
const DEFAULT_PRESET_LAYOUTS: PresetLayout[] = [
  {
    id: "preset-simple",
    name: "Layout Simple",
    description: "Un layout simple avec les widgets essentiels",
    category: "simple",
    thumbnail: "/placeholder-48ale.png",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: uuidv4(),
        type: "market",
        title: "Aperçu du marché",
        position: { i: "market", x: 0, y: 0, w: 12, h: 4 },
        settings: {
          displayCount: 5,
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "favorites",
        title: "Mes favoris",
        position: { i: "favorites", x: 0, y: 4, w: 6, h: 4 },
        settings: {
          displayCount: 5,
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
        },
        visible: true,
      },
    ],
  },
  {
    id: "preset-analytics",
    name: "Layout Analytique",
    description: "Un layout optimisé pour l'analyse des données",
    category: "analytics",
    thumbnail: "/analytics-dashboard-layout.png",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: uuidv4(),
        type: "market",
        title: "Aperçu du marché",
        position: { i: "market", x: 0, y: 0, w: 4, h: 4 },
        settings: {
          displayCount: 3,
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "prediction",
        title: "Prédictions",
        position: { i: "prediction", x: 4, y: 0, w: 8, h: 4 },
        settings: {
          symbol: "AAPL",
          timeframe: "7d",
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "stock",
        title: "AAPL",
        position: { i: "stock-aapl", x: 0, y: 4, w: 6, h: 6 },
        settings: {
          symbol: "AAPL",
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "performance",
        title: "Performance",
        position: { i: "performance", x: 6, y: 4, w: 6, h: 6 },
        settings: {
          period: "30d",
        },
        visible: true,
      },
    ],
  },
  {
    id: "preset-monitoring",
    name: "Layout de Surveillance",
    description: "Un layout pour surveiller plusieurs actifs simultanément",
    category: "monitoring",
    thumbnail: "/placeholder-gpkio.png",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: uuidv4(),
        type: "alerts",
        title: "Alertes",
        position: { i: "alerts", x: 0, y: 0, w: 12, h: 3 },
        settings: {
          showUnreadOnly: true,
          maxItems: 5,
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "stock",
        title: "AAPL",
        position: { i: "stock-aapl", x: 0, y: 3, w: 4, h: 4 },
        settings: {
          symbol: "AAPL",
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "stock",
        title: "MSFT",
        position: { i: "stock-msft", x: 4, y: 3, w: 4, h: 4 },
        settings: {
          symbol: "MSFT",
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "stock",
        title: "GOOGL",
        position: { i: "stock-googl", x: 8, y: 3, w: 4, h: 4 },
        settings: {
          symbol: "GOOGL",
        },
        visible: true,
      },
      {
        id: uuidv4(),
        type: "news",
        title: "Actualités financières",
        position: { i: "news", x: 0, y: 7, w: 12, h: 4 },
        settings: {
          maxItems: 5,
        },
        visible: true,
      },
    ],
  },
]

// Fonction pour obtenir tous les layouts prédéfinis
export async function getPresetLayouts(user: any): Promise<PresetLayout[]> {
  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, utiliser le stockage local
  if (!user || isOfflineModeEnabled()) {
    return getLocalPresetLayouts()
  }

  // Si l'utilisateur est connecté, récupérer depuis Supabase
  try {
    const supabase = createClientComponentClient()

    // Récupérer les layouts prédéfinis publics et ceux créés par l'utilisateur
    const { data, error } = await supabase
      .from("preset_layouts")
      .select("*")
      .or(`is_public.eq.true,created_by.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      // Si aucun layout prédéfini n'existe, utiliser les layouts par défaut
      return DEFAULT_PRESET_LAYOUTS
    }

    // Convertir les données de Supabase au format attendu
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      thumbnail: item.thumbnail,
      widgets: item.layout.widgets || [],
      createdBy: item.created_by,
      isPublic: item.is_public,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des layouts prédéfinis:", error)
    // En cas d'erreur, utiliser les layouts prédéfinis locaux
    return getLocalPresetLayouts()
  }
}

// Fonction pour obtenir les layouts prédéfinis locaux
function getLocalPresetLayouts(): PresetLayout[] {
  if (typeof window === "undefined") {
    return DEFAULT_PRESET_LAYOUTS
  }

  try {
    const storedLayouts = localStorage.getItem(PRESET_LAYOUTS_KEY)
    if (storedLayouts) {
      return JSON.parse(storedLayouts)
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des layouts prédéfinis locaux:", error)
  }

  // Sauvegarder les layouts par défaut dans le stockage local
  try {
    localStorage.setItem(PRESET_LAYOUTS_KEY, JSON.stringify(DEFAULT_PRESET_LAYOUTS))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des layouts prédéfinis locaux:", error)
  }

  return DEFAULT_PRESET_LAYOUTS
}

// Fonction pour sauvegarder un layout actuel comme layout prédéfini
export async function saveAsPresetLayout(
  user: any,
  dashboardLayout: DashboardLayout,
  name: string,
  description: string,
  category: "simple" | "analytics" | "monitoring" | "custom",
  isPublic = false,
): Promise<PresetLayout | null> {
  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, sauvegarder localement
  if (!user || isOfflineModeEnabled()) {
    return saveLocalPresetLayout(dashboardLayout, name, description, category, isPublic)
  }

  // Si l'utilisateur est connecté, sauvegarder dans Supabase
  try {
    const supabase = createClientComponentClient()

    const newPresetLayout: PresetLayout = {
      id: uuidv4(),
      name,
      description,
      category,
      thumbnail: `/placeholder.svg?height=150&width=300&query=${encodeURIComponent(name)}+dashboard+layout`,
      widgets: dashboardLayout.widgets,
      createdBy: user.id,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Insérer le nouveau layout prédéfini
    const { error } = await supabase.from("preset_layouts").insert({
      id: newPresetLayout.id,
      name: newPresetLayout.name,
      description: newPresetLayout.description,
      category: newPresetLayout.category,
      thumbnail: newPresetLayout.thumbnail,
      layout: { widgets: newPresetLayout.widgets },
      created_by: newPresetLayout.createdBy,
      is_public: newPresetLayout.isPublic,
      created_at: newPresetLayout.createdAt,
      updated_at: newPresetLayout.updatedAt,
    })

    if (error) throw error

    return newPresetLayout
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du layout prédéfini:", error)
    return null
  }
}

// Fonction pour sauvegarder un layout prédéfini localement
function saveLocalPresetLayout(
  dashboardLayout: DashboardLayout,
  name: string,
  description: string,
  category: "simple" | "analytics" | "monitoring" | "custom",
  isPublic = false,
): PresetLayout | null {
  try {
    // Récupérer les layouts prédéfinis existants
    const existingLayouts = getLocalPresetLayouts()

    // Créer un nouveau layout prédéfini
    const newPresetLayout: PresetLayout = {
      id: uuidv4(),
      name,
      description,
      category,
      thumbnail: `/placeholder.svg?height=150&width=300&query=${encodeURIComponent(name)}+dashboard+layout`,
      widgets: dashboardLayout.widgets,
      createdBy: "local",
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Ajouter le nouveau layout à la liste
    const updatedLayouts = [...existingLayouts, newPresetLayout]

    // Sauvegarder la liste mise à jour
    localStorage.setItem(PRESET_LAYOUTS_KEY, JSON.stringify(updatedLayouts))

    return newPresetLayout
  } catch (error) {
    console.error("Erreur lors de la sauvegarde locale du layout prédéfini:", error)
    return null
  }
}

// Fonction pour supprimer un layout prédéfini
export async function deletePresetLayout(user: any, presetId: string): Promise<boolean> {
  // Si l'utilisateur n'est pas connecté ou en mode hors ligne, supprimer localement
  if (!user || isOfflineModeEnabled()) {
    return deleteLocalPresetLayout(presetId)
  }

  // Si l'utilisateur est connecté, supprimer dans Supabase
  try {
    const supabase = createClientComponentClient()

    // Vérifier que l'utilisateur est le créateur du layout
    const { data, error: checkError } = await supabase
      .from("preset_layouts")
      .select("created_by")
      .eq("id", presetId)
      .single()

    if (checkError) throw checkError

    // Si l'utilisateur n'est pas le créateur, refuser la suppression
    if (data.created_by !== user.id) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce layout prédéfini")
    }

    // Supprimer le layout
    const { error } = await supabase.from("preset_layouts").delete().eq("id", presetId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du layout prédéfini:", error)
    return false
  }
}

// Fonction pour supprimer un layout prédéfini localement
function deleteLocalPresetLayout(presetId: string): boolean {
  try {
    // Récupérer les layouts prédéfinis existants
    const existingLayouts = getLocalPresetLayouts()

    // Filtrer pour supprimer le layout
    const updatedLayouts = existingLayouts.filter((layout) => layout.id !== presetId)

    // Sauvegarder la liste mise à jour
    localStorage.setItem(PRESET_LAYOUTS_KEY, JSON.stringify(updatedLayouts))

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression locale du layout prédéfini:", error)
    return false
  }
}

// Fonction pour appliquer un layout prédéfini au tableau de bord actuel
export function applyPresetLayout(presetLayout: PresetLayout): WidgetConfig[] {
  // Générer de nouveaux IDs pour éviter les conflits
  return presetLayout.widgets.map((widget) => ({
    ...widget,
    id: uuidv4(),
    position: {
      ...widget.position,
      i: uuidv4(), // Générer un nouvel identifiant pour la position
    },
  }))
}
