// Types pour les widgets de la page d'accueil
export interface HomeWidgetPosition {
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

export interface HomeWidgetConfig {
  id: string
  type: string
  title: string
  position: HomeWidgetPosition
  visible: boolean
  settings?: Record<string, any>
}

export interface HomeLayout {
  id: string
  userId: string
  widgets: HomeWidgetConfig[]
  lastUpdated: string
}

// Définitions des tailles par défaut par type de widget
export const widgetSizeDefaults = {
  welcome: {
    minW: 6,
    minH: 2,
    defaultW: 12,
    defaultH: 3,
    maxW: 12,
    maxH: 6,
  },
  "market-overview": {
    minW: 3,
    minH: 3,
    defaultW: 6,
    defaultH: 4,
    maxW: 12,
    maxH: 8,
  },
  news: {
    minW: 3,
    minH: 3,
    defaultW: 6,
    defaultH: 4,
    maxW: 12,
    maxH: 10,
  },
  favorites: {
    minW: 3,
    minH: 3,
    defaultW: 6,
    defaultH: 4,
    maxW: 12,
    maxH: 8,
  },
  performance: {
    minW: 4,
    minH: 4,
    defaultW: 8,
    defaultH: 5,
    maxW: 12,
    maxH: 10,
  },
  stock: {
    minW: 3,
    minH: 3,
    defaultW: 4,
    defaultH: 4,
    maxW: 12,
    maxH: 8,
  },
  default: {
    minW: 3,
    minH: 2,
    defaultW: 6,
    defaultH: 4,
    maxW: 12,
    maxH: 10,
  },
}

// Obtenir les tailles de widget par type
export function getWidgetSizeDefaults(widgetType: string) {
  return widgetSizeDefaults[widgetType as keyof typeof widgetSizeDefaults] || widgetSizeDefaults.default
}

// Fonction pour obtenir le layout de la page d'accueil
export async function getHomeLayout(user: any): Promise<HomeLayout> {
  // Simuler un délai de chargement
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Retourner un layout par défaut
  return {
    id: "default",
    userId: user?.id || "anonymous",
    widgets: [
      {
        id: "welcome",
        type: "welcome",
        title: "Bienvenue",
        position: {
          i: "welcome",
          x: 0,
          y: 0,
          w: 12,
          h: 3,
          minH: 2,
          minW: 6,
          maxW: 12,
          maxH: 6,
        },
        visible: true,
        settings: {
          showSignup: true,
        },
      },
      {
        id: "market-overview",
        type: "market-overview",
        title: "Aperçu du marché",
        position: {
          i: "market-overview",
          x: 0,
          y: 3,
          w: 6,
          h: 4,
          minH: 3,
          minW: 3,
          maxW: 12,
          maxH: 8,
        },
        visible: true,
        settings: {
          indices: ["S&P 500", "NASDAQ", "DOW", "RUSSELL 2000"],
        },
      },
      {
        id: "news",
        type: "news",
        title: "Actualités financières",
        position: {
          i: "news",
          x: 6,
          y: 3,
          w: 6,
          h: 4,
          minH: 3,
          minW: 3,
          maxW: 12,
          maxH: 10,
        },
        visible: true,
        settings: {
          maxItems: 4,
          category: "business",
        },
      },
    ],
    lastUpdated: new Date().toISOString(),
  }
}

// Fonction pour sauvegarder le layout de la page d'accueil
export async function saveHomeLayout(user: any, layout: HomeLayout): Promise<boolean> {
  if (!user) return false

  try {
    // Simuler une sauvegarde dans une API ou une base de données
    console.log("Layout sauvegardé:", layout)
    return true
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du layout:", error)
    return false
  }
}

// Fonction pour réinitialiser le layout de la page d'accueil
export async function resetHomeLayout(user: any): Promise<boolean> {
  if (!user) return false

  try {
    // Simuler une réinitialisation dans une API ou une base de données
    console.log("Layout réinitialisé pour l'utilisateur:", user)
    return true
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du layout:", error)
    return false
  }
}

// Fonction pour ajouter un widget à la page d'accueil
export async function addHomeWidget(user: any, type: string, title: string, settings: any): Promise<boolean> {
  if (!user) return false

  try {
    // Simuler un ajout dans une API ou une base de données
    console.log("Widget ajouté:", { type, title, settings })

    // Dans une implémentation réelle, vous ajouteriez le widget à la base de données
    // et retourneriez le layout mis à jour

    return true
  } catch (error) {
    console.error("Erreur lors de l'ajout du widget:", error)
    return false
  }
}

// Fonction pour supprimer un widget de la page d'accueil
export async function removeHomeWidget(user: any, widgetId: string): Promise<boolean> {
  if (!user) return false

  try {
    // Simuler une suppression dans une API ou une base de données
    console.log("Widget supprimé:", widgetId)
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du widget:", error)
    return false
  }
}

// Fonction pour mettre à jour un widget de la page d'accueil
export async function updateHomeWidget(user: any, widgetId: string, updates: any): Promise<boolean> {
  if (!user) return false

  try {
    // Simuler une mise à jour dans une API ou une base de données
    console.log("Widget mis à jour:", { widgetId, updates })
    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour du widget:", error)
    return false
  }
}
