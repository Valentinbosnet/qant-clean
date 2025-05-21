"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import type { DashboardTemplate } from "@/lib/dashboard-templates"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LayoutGrid,
  BarChart4,
  TrendingUp,
  LineChart,
  PieChart,
  Bell,
  FileText,
  Globe,
  Newspaper,
  AlertTriangle,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import type { AccessibilityMode } from "./accessibility-controls"
import type { ErrorStateType } from "./error-state-controls"
import type { PresentationModeOptions } from "./presentation-mode-controls"
import type { PerformancePreviewOptions } from "./performance-preview-controls"
import type { ExportOptions } from "./export-preview-controls"

// Wrapper pour le composant Responsive avec la fonction WidthProvider
const ResponsiveGridLayout = WidthProvider(Responsive)

// Interface TemplatePreviewProps
interface TemplatePreviewProps {
  template: DashboardTemplate
  interactive?: boolean
  onAccessibilityChange?: (mode: AccessibilityMode) => void
  onErrorStateChange?: (state: ErrorStateType) => void
}

export function TemplatePreview({
  template,
  interactive = true,
  onAccessibilityChange,
  onErrorStateChange,
}: TemplatePreviewProps) {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile" | "responsive">("desktop")
  const [previewWidth, setPreviewWidth] = useState(1200)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light")
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>("none")
  const [errorState, setErrorState] = useState<ErrorStateType>("none")
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [presentationOptions, setPresentationOptions] = useState<PresentationModeOptions>({
    hideControls: false,
    focusMode: false,
    highlightWidgets: [],
    hideWidgets: [],
  })
  const [isPerformancePreview, setIsPerformancePreview] = useState(false)
  const [performanceOptions, setPerformanceOptions] = useState<PerformancePreviewOptions>({
    dataSize: "medium",
    animationSpeed: 2,
    simulateNetworkDelay: false,
    delayMs: 1000,
  })
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "png",
    includeTitle: true,
    includeBorder: true,
    highQuality: true,
    fileName: `dashboard-${template.name.toLowerCase().replace(/\s+/g, "-")}`,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [fps, setFps] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fpsRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(performance.now())

  // Effets pour les callbacks
  useEffect(() => {
    if (onAccessibilityChange) {
      onAccessibilityChange(accessibilityMode)
    }
  }, [accessibilityMode, onAccessibilityChange])

  useEffect(() => {
    if (onErrorStateChange) {
      onErrorStateChange(errorState)
    }
  }, [errorState, onErrorStateChange])

  // Définir les breakpoints et colonnes pour le layout responsive
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

  // Mettre à jour le state mounted après le montage du composant
  useEffect(() => {
    setMounted(true)
  }, [])

  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    if (!previewRef.current) return

    if (!isFullscreen) {
      if (previewRef.current.requestFullscreen) {
        previewRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Écouter les changements de mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Effet pour simuler le chargement des données en mode performance preview
  useEffect(() => {
    if (!isPerformancePreview || !performanceOptions.simulateNetworkDelay) {
      setIsLoading(false)
      return
    }

    const loadData = () => {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // Simuler un rechargement périodique des données
        setTimeout(loadData, Math.random() * 10000 + 5000)
      }, performanceOptions.delayMs)
    }

    loadData()

    return () => {
      setIsLoading(false)
    }
  }, [isPerformancePreview, performanceOptions.simulateNetworkDelay, performanceOptions.delayMs])

  // Mesurer les FPS pour le mode performance preview
  useEffect(() => {
    if (!isPerformancePreview) {
      setFps(null)
      return
    }

    const measureFps = () => {
      const now = performance.now()
      const elapsed = now - lastTimeRef.current
      frameCountRef.current++

      if (elapsed >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed)
        setFps(fpsRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      requestAnimationFrame(measureFps)
    }

    const animationId = requestAnimationFrame(measureFps)
    return () => cancelAnimationFrame(animationId)
  }, [isPerformancePreview])

  // Obtenir la largeur en fonction du mode de visualisation
  const getPreviewWidth = () => {
    switch (viewMode) {
      case "mobile":
        return 480
      case "tablet":
        return 768
      case "desktop":
        return 1200
      case "responsive":
        return previewWidth
      default:
        return 1200
    }
  }

  // Obtenir l'icône pour un type de widget
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "market":
        return <BarChart4 className="h-5 w-5" />
      case "favorites":
        return <TrendingUp className="h-5 w-5" />
      case "stock":
        return <LineChart className="h-5 w-5" />
      case "prediction":
        return <TrendingUp className="h-5 w-5" />
      case "sector":
        return <PieChart className="h-5 w-5" />
      case "alerts":
        return <Bell className="h-5 w-5" />
      case "notes":
        return <FileText className="h-5 w-5" />
      case "news":
        return <Newspaper className="h-5 w-5" />
      case "performance":
        return <BarChart4 className="h-5 w-5" />
      default:
        return <LayoutGrid className="h-5 w-5" />
    }
  }

  // Simuler le contenu d'un widget en fonction de l'état d'erreur
  const renderWidgetContent = (type: string) => {
    // Si nous sommes en état d'erreur, afficher l'état d'erreur approprié
    if (errorState !== "none") {
      return renderErrorState(type, errorState)
    }

    // Sinon, afficher le contenu normal
    switch (type) {
      case "market":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">S&P 500</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +1.2%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">NASDAQ</span>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                -0.8%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">DOW</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +0.5%
              </Badge>
            </div>
          </div>
        )
      case "favorites":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">AAPL</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +2.3%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">MSFT</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +1.7%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">GOOGL</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                -0.4%
              </Badge>
            </div>
          </div>
        )
      case "stock":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">AAPL</span>
              <div className="text-right">
                <div className="font-bold">$182.63</div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  +$4.23 (2.3%)
                </Badge>
              </div>
            </div>
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <LineChart className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Ouverture</div>
                <div>$178.40</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Haut</div>
                <div>$183.12</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Bas</div>
                <div>$177.95</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Volume</div>
                <div>68.2M</div>
              </div>
            </div>
          </div>
        )
      case "prediction":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">AAPL</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Prédiction</Badge>
            </div>
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <TrendingUp className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Direction</div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  Hausse
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-gray-500 dark:text-gray-400">Confiance</div>
                <div>78%</div>
              </div>
            </div>
          </div>
        )
      case "sector":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Technologie</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +2.1%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Énergie</span>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                -1.5%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Santé</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +0.7%
              </Badge>
            </div>
          </div>
        )
      case "alerts":
        return (
          <div className="space-y-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-start">
                <Bell className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">AAPL a dépassé le seuil de 180$</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 35 minutes</p>
                </div>
              </div>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start">
                <Bell className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">MSFT a baissé de plus de 2%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 1 heure</p>
                </div>
              </div>
            </div>
          </div>
        )
      case "notes":
        return (
          <div className="space-y-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-sm font-medium">Analyse de $AAPL</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Résultats trimestriels supérieurs aux attentes...
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 2 jours</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-sm font-medium">Idées d'investissement</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Surveiller $NVDA et $AMD pour une entrée...</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 5 jours</p>
            </div>
          </div>
        )
      case "news":
        return (
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">La Fed maintient ses taux d'intérêt</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Les marchés réagissent positivement...</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 3 heures</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Apple dépasse les attentes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Les ventes d'iPhone en hausse de 10%...</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 5 heures</p>
              </div>
            </div>
          </div>
        )
      case "performance":
        return (
          <div className="space-y-3">
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <BarChart4 className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Précision</div>
                <div>76%</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Prédictions</div>
                <div>124</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Correctes</div>
                <div>94</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Incorrectes</div>
                <div>30</div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-20 w-full" />
          </div>
        )
    }
  }

  // Fonction pour rendre les états d'erreur
  const renderErrorState = (type: string, errorState: ErrorStateType) => {
    switch (errorState) {
      case "no-data":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="bg-muted/50 rounded-full p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium mb-1">Aucune donnée disponible</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {type === "favorites"
                ? "Ajoutez des favoris pour les voir apparaître ici"
                : type === "notes"
                  ? "Créez des notes pour les voir apparaître ici"
                  : "Aucune donnée n'est disponible pour le moment"}
            </p>
            <Button variant="outline" size="sm" className="text-xs">
              {type === "favorites" ? "Ajouter des favoris" : type === "notes" ? "Créer une note" : "Actualiser"}
            </Button>
          </div>
        )
      case "loading-error":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <h4 className="text-sm font-medium mb-1 text-red-600 dark:text-red-400">Erreur de chargement</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Impossible de charger les données. Veuillez réessayer ultérieurement.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Réessayer
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Signaler
              </Button>
            </div>
          </div>
        )
      case "network-offline":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-3 mb-3">
              <WifiOff className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
            <h4 className="text-sm font-medium mb-1 text-amber-600 dark:text-amber-400">Vous êtes hors ligne</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {type === "market" || type === "stock" || type === "news"
                ? "Les données en temps réel ne sont pas disponibles en mode hors ligne"
                : "Certaines fonctionnalités peuvent être limitées en mode hors ligne"}
            </p>
            <Button variant="outline" size="sm" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Vérifier la connexion
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  // Convertir les widgets du modèle en layout pour react-grid-layout
  const getLayoutFromTemplate = () => {
    return template.widgets
      .filter((widget) => !presentationOptions.hideWidgets.includes(widget.position.i))
      .map((widget) => ({
        ...widget.position,
        static: !interactive,
      }))
  }

  // Obtenir les classes CSS pour le mode d'accessibilité
  const getAccessibilityClasses = () => {
    if (accessibilityMode === "none") return ""
    return `a11y-${accessibilityMode}`
  }

  // Obtenir les classes CSS pour le mode présentation
  const getPresentationClasses = () => {
    if (!isPresentationMode) return ""
    let classes = "presentation-mode"
    if (presentationOptions.hideControls) classes += " hide-controls"
    if (presentationOptions.focusMode) classes += " focus-mode"
    return classes
  }

  // Obtenir les classes CSS pour la prévisualisation des performances
  const getPerformanceClasses = () => {
    if (!isPerformancePreview) return ""
    let classes = `performance-preview data-${performanceOptions.dataSize} animation-${performanceOptions.animationSpeed}`
    if (isLoading) classes += " loading"
    return classes
  }

  // Vérifier si un widget est mis en évidence en mode présentation
  const isWidgetHighlighted = (widgetId: string) => {
    return (
      isPresentationMode && presentationOptions.focusMode && presentationOptions.highlightWidgets.includes(widgetId)
    )
  }

  // Obtenir les titres des widgets pour les contrôles de présentation
  const getWidgetTitles = useCallback(() => {
    const titles: Record<string, string> = {}
    template.widgets.forEach((widget) => {
      titles[widget.position.i] = widget.title
    })
    return titles
  }, [template.widgets])

  // Obtenir les IDs des widgets pour les contrôles de présentation
  const getWidgetIds = useCallback(() => {
    return template.widgets.map((widget) => widget.position.i)
  }, [template.widgets])

  return (
    <div className={`space-y-4 ${previewTheme === "dark" ? "preview-dark" : ""}`}>
      {/* Content of the TemplatePreview component */}
    </div>
  )
}
