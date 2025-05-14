"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  getDashboardLayout,
  getUserDashboardLayouts,
  saveDashboardLayout,
  type DashboardLayout,
  type WidgetPosition,
  type DashboardSettings,
  getDashboardSettings,
} from "@/lib/dashboard-service"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Widget } from "./widget"
import { WidgetMenu } from "./widget-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Save, Loader2 } from "lucide-react"
import Link from "next/link"

const ResponsiveGridLayout = WidthProvider(Responsive)

export function ConfigurableDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const layoutId = searchParams.get("layout")

  const [dashboardConfig, setDashboardConfig] = useState<DashboardLayout | null>(null)
  const [availableLayouts, setAvailableLayouts] = useState<DashboardLayout[]>([])
  const [settings, setSettings] = useState<DashboardSettings>(getDashboardSettings())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(true)

  // Charger le layout spécifié ou le layout par défaut
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      try {
        let layout: DashboardLayout | null = null

        // Charger tous les layouts disponibles
        const layouts = await getUserDashboardLayouts(user)
        setAvailableLayouts(layouts)
        setIsLoadingLayouts(false)

        // Si un ID de layout est spécifié, charger ce layout
        if (layoutId) {
          const selectedLayout = layouts.find((l) => l.id === layoutId)
          if (selectedLayout) {
            layout = selectedLayout
          }
        }

        // Si aucun layout n'est spécifié ou si le layout spécifié n'existe pas, charger le layout par défaut
        if (!layout) {
          layout = await getDashboardLayout(user)
        }

        setDashboardConfig(layout)
      } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger votre tableau de bord",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [user, toast, layoutId])

  // Gérer le changement de layout
  const handleLayoutChange = useCallback(
    async (layout: any, layouts: any) => {
      if (!dashboardConfig) return

      const currentLayout = layouts.lg || layout
      const positions: WidgetPosition[] = currentLayout.map((item: any) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH,
      }))

      // Mettre à jour le state local immédiatement pour une UI réactive
      setDashboardConfig((prev) => {
        if (!prev) return prev

        const updatedWidgets = prev.widgets.map((widget) => {
          const newPos = positions.find((pos) => pos.i === widget.position.i)
          if (newPos) {
            return {
              ...widget,
              position: newPos,
            }
          }
          return widget
        })

        return {
          ...prev,
          widgets: updatedWidgets,
          lastUpdated: new Date().toISOString(),
        }
      })
    },
    [dashboardConfig],
  )

  // Sauvegarder le layout
  const handleSaveLayout = useCallback(async () => {
    if (!dashboardConfig) return

    setIsSaving(true)
    try {
      const success = await saveDashboardLayout(user, dashboardConfig)
      if (success) {
        toast({
          title: "Layout sauvegardé",
          description: "Votre tableau de bord a été sauvegardé avec succès",
        })
      } else {
        throw new Error("Échec de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du tableau de bord:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [dashboardConfig, user, toast])

  // Changer de layout
  const handleChangeLayout = useCallback(
    (selectedLayoutId: string) => {
      const selectedLayout = availableLayouts.find((l) => l.id === selectedLayoutId)
      if (selectedLayout) {
        setDashboardConfig(selectedLayout)
        // Mettre à jour l'URL sans recharger la page
        const url = new URL(window.location.href)
        url.searchParams.set("layout", selectedLayoutId)
        window.history.pushState({}, "", url.toString())
      }
    },
    [availableLayouts],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!dashboardConfig) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-lg text-red-500">Impossible de charger le tableau de bord.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dashboardConfig.name}</h1>
          <p className="text-sm text-muted-foreground">
            Dernière modification: {new Date(dashboardConfig.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Select value={dashboardConfig.id} onValueChange={handleChangeLayout} disabled={isLoadingLayouts}>
              <SelectTrigger className="w-[200px]">
                {isLoadingLayouts ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Sélectionner un layout" />
                )}
              </SelectTrigger>
              <SelectContent>
                {availableLayouts.map((layout) => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name} {layout.isDefault && "(Par défaut)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" asChild title="Gérer les layouts">
              <Link href="/dashboard/manage">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <WidgetMenu dashboardConfig={dashboardConfig} setDashboardConfig={setDashboardConfig} />
            <Button onClick={handleSaveLayout} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`border rounded-lg ${settings.showWidgetBorders ? "bg-gray-50 dark:bg-gray-900" : "bg-transparent"}`}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={{
            lg: dashboardConfig.widgets
              .filter((widget) => widget.visible)
              .map((widget) => ({
                ...widget.position,
                static: false,
              })),
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: settings.columns, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={settings.rowHeight}
          onLayoutChange={handleLayoutChange}
          compactType={settings.compactType}
          preventCollision={settings.preventCollision}
          isResizable={true}
          isDraggable={true}
          margin={[16, 16]}
        >
          {dashboardConfig.widgets
            .filter((widget) => widget.visible)
            .map((widget) => (
              <div key={widget.position.i} data-grid={widget.position}>
                <Widget
                  key={widget.id}
                  widget={widget}
                  dashboardConfig={dashboardConfig}
                  setDashboardConfig={setDashboardConfig}
                  showBorder={settings.showWidgetBorders}
                />
              </div>
            ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}
