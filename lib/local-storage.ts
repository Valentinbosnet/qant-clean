// Utilitaire pour stocker des données localement si la base de données n'est pas disponible

// Type pour les portfolios locaux
export interface LocalPortfolio {
  id: string
  name: string
  balance: number
  currency: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

// Clé pour le stockage local
const PORTFOLIOS_KEY = "local_portfolios"

// Fonction pour générer un ID unique
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Fonction pour récupérer les portfolios locaux
export function getLocalPortfolios(userId: string): LocalPortfolio[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedData = localStorage.getItem(PORTFOLIOS_KEY)
    if (!storedData) {
      return []
    }

    const allPortfolios = JSON.parse(storedData) as LocalPortfolio[]
    return allPortfolios.filter((portfolio) => portfolio.userId === userId)
  } catch (error) {
    console.error("Erreur lors de la récupération des portfolios locaux:", error)
    return []
  }
}

// Fonction pour ajouter un portfolio local
export function addLocalPortfolio(portfolio: Omit<LocalPortfolio, "id" | "createdAt" | "updatedAt">): LocalPortfolio {
  if (typeof window === "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté client")
  }

  try {
    const storedData = localStorage.getItem(PORTFOLIOS_KEY)
    const allPortfolios = storedData ? (JSON.parse(storedData) as LocalPortfolio[]) : []

    const now = new Date().toISOString()
    const newPortfolio: LocalPortfolio = {
      ...portfolio,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }

    allPortfolios.push(newPortfolio)
    localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(allPortfolios))

    return newPortfolio
  } catch (error) {
    console.error("Erreur lors de l'ajout du portfolio local:", error)
    throw error
  }
}

// Fonction pour mettre à jour un portfolio local
export function updateLocalPortfolio(id: string, updates: Partial<LocalPortfolio>): LocalPortfolio {
  if (typeof window === "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté client")
  }

  try {
    const storedData = localStorage.getItem(PORTFOLIOS_KEY)
    if (!storedData) {
      throw new Error("Aucun portfolio trouvé")
    }

    const allPortfolios = JSON.parse(storedData) as LocalPortfolio[]
    const portfolioIndex = allPortfolios.findIndex((p) => p.id === id)

    if (portfolioIndex === -1) {
      throw new Error("Portfolio non trouvé")
    }

    const updatedPortfolio = {
      ...allPortfolios[portfolioIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    allPortfolios[portfolioIndex] = updatedPortfolio
    localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(allPortfolios))

    return updatedPortfolio
  } catch (error) {
    console.error("Erreur lors de la mise à jour du portfolio local:", error)
    throw error
  }
}

// Fonction pour supprimer un portfolio local
export function deleteLocalPortfolio(id: string): void {
  if (typeof window === "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté client")
  }

  try {
    const storedData = localStorage.getItem(PORTFOLIOS_KEY)
    if (!storedData) {
      return
    }

    const allPortfolios = JSON.parse(storedData) as LocalPortfolio[]
    const updatedPortfolios = allPortfolios.filter((p) => p.id !== id)

    localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(updatedPortfolios))
  } catch (error) {
    console.error("Erreur lors de la suppression du portfolio local:", error)
    throw error
  }
}
