"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getDashboardLayout,
  saveDashboardLayout,
  updateWidget,
  addWidget,
  removeWidget,
  updateLayout,
  resetDashboard,
  getDashboardSettings,
  saveDashboardSettings,
  type DashboardLayout,
  type WidgetConfig,
  type WidgetPosition,
  type DashboardSettings,
  DEFAULT_DASHBOARD_SETTINGS,
} from "@/lib/dashboard-service"
import { useToast } from "@/hooks/use-toast"

export function useDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [layout, setLayout] = useState<DashboardLayout | null>(null)
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_DASHBOARD_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Charger le layout
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      try {
        const dashboardLayout = await getDashboardLayout(user)
        setLayout(dashboardLayout)

        const dashboardSettings = getDashboardSettings()
        setSettings(dashboardSettings)
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
  }, [user, toast])

  // Sauvegarder les modifications du layout
  const saveLayout = useCallback(
    async (newLayout: DashboardLayout) => {
      setIsSaving(true)
      try {
        const success = await saveDashboardLayout(user, newLayout)
        if (success) {
          setLayout(newLayout)
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
    },
    [user, toast],
  )

  // Mettre à jour les widgets après un drag-and-drop
  const handleLayoutChange = useCallback(
    async (positions: WidgetPosition[]) => {
      if (!layout) return

      setIsSaving(true)
      try {
        const success = await updateLayout(user, positions)
        if (success && layout) {
          // Mettre à jour le state local avec les nouvelles positions
          const updatedWidgets = layout.widgets.map((widget) => {
            const newPos = positions.find((p) => p.i === widget.position.i)
            if (newPos) {
              return {
                ...widget,
                position: newPos,
              }
            }
            return widget
          })

          setLayout({
            ...layout,
            widgets: updatedWidgets,
            lastUpdated: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du layout:", error)
      } finally {
        setIsSaving(false)
      }
    },
    [layout, user],
  )

  // Ajouter un widget
  const handleAddWidget = useCallback(
    async (type: string, title: string, settings: any = {}) => {
      setIsSaving(true)
      try {
        const success = await addWidget(user, type, title, settings)
        if (success) {
          // Recharger le layout après l'ajout
          const newLayout = await getDashboardLayout(user)
          setLayout(newLayout)
          toast({
            title: "Widget ajouté",
            description: `"${title}" a été ajouté à votre tableau de bord`,
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Erreur lors de l'ajout du widget:", error)
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le widget",
          variant: "destructive",
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [user, toast],
  )

  // Mettre à jour un widget
  const handleUpdateWidget = useCallback(
    async (widgetId: string, updates: Partial<WidgetConfig>) => {
      if (!layout) return false

      setIsSaving(true)
      try {
        const success = await updateWidget(user, widgetId, updates)
        if (success) {
          // Mettre à jour le state local
          const updatedWidgets = layout.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget,
          )

          setLayout({
            ...layout,
            widgets: updatedWidgets,
            lastUpdated: new Date().toISOString(),
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Erreur lors de la mise à jour du widget:", error)
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le widget",
          variant: "destructive",
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [layout, user, toast],
  )

  // Supprimer un widget
  const handleRemoveWidget = useCallback(
    async (widgetId: string) => {
      if (!layout) return false

      setIsSaving(true)
      try {
        const success = await removeWidget(user, widgetId)
        if (success) {
          // Mettre à jour le state local
          const updatedWidgets = layout.widgets.filter((widget) => widget.id !== widgetId)

          setLayout({
            ...layout,
            widgets: updatedWidgets,
            lastUpdated: new Date().toISOString(),
          })

          toast({
            title: "Widget supprimé",
            description: "Le widget a été supprimé de votre tableau de bord",
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Erreur lors de la suppression du widget:", error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le widget",
          variant: "destructive",
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [layout, user, toast],
  )

  // Réinitialiser le tableau de bord
  const handleResetDashboard = useCallback(async () => {
    setIsSaving(true)
    try {
      const success = await resetDashboard(user)
      if (success) {
        const newLayout = await getDashboardLayout(user)
        setLayout(newLayout)
        toast({
          title: "Tableau de bord réinitialisé",
          description: "Votre tableau de bord a été réinitialisé",
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du tableau de bord:", error)
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le tableau de bord",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }, [user, toast])

  // Mettre à jour les paramètres
  const updateSettings = useCallback(
    (newSettings: Partial<DashboardSettings>) => {
      const updatedSettings = { ...settings, ...newSettings }
      saveDashboardSettings(updatedSettings)
      setSettings(updatedSettings)
    },
    [settings],
  )

  return {
    layout,
    settings,
    isLoading,
    isSaving,
    saveLayout,
    handleLayoutChange,
    handleAddWidget,
    handleUpdateWidget,
    handleRemoveWidget,
    handleResetDashboard,
    updateSettings,
  }
}
