"use client"

import { useState } from "react"
import { useDashboard } from "@/hooks/use-dashboard"
import { Responsive, WidthProvider, type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Widget } from "./widget"
import { WidgetMenu } from "./widget-menu"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, RotateCcw, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WidgetSettings } from "./widget-settings"

// Version responsive du grid layout
const ResponsiveGridLayout = WidthProvider(Responsive)

export function ConfigurableDashboard() {
  const {
    layout,
    settings,
    isLoading,
    isSaving,
    handleLayoutChange,
    handleAddWidget,
    handleUpdateWidget,
    handleRemoveWidget,
    handleResetDashboard,
    updateSettings,
  } = useDashboard()

  const [showWidgetMenu, setShowWidgetMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Gérer les changements de layout
  const onLayoutChange = (currentLayout: Layout[]) => {
    if (!editMode) return
    handleLayoutChange(currentLayout)
  }

  // Obtenir le layout pour la bibliothèque react-grid-layout
  const getGridLayout = () => {
    if (!layout) return { lg: [] }

    return {
      lg: layout.widgets.filter((widget) => widget.visible).map((widget) => widget.position),
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-medium mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground mb-4">
          Impossible de charger votre tableau de bord. Veuillez rafraîchir la page.
        </p>
        <Button onClick={() => window.location.reload()}>Rafraîchir</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mon Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground">
            {editMode
              ? "Mode édition : glissez-déposez les widgets pour les réorganiser ou redimensionnez-les"
              : "Personnalisez votre tableau de bord avec les widgets qui vous intéressent"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <Badge
              variant="outline"
              className="bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800"
            >
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Sauvegarde...
            </Badge>
          )}

          <Button variant={editMode ? "default" : "outline"} onClick={() => setEditMode(!editMode)}>
            {editMode ? "Terminer l'édition" : "Modifier"}
          </Button>

          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>

          <Button onClick={() => setShowWidgetMenu(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un widget
          </Button>
        </div>
      </div>

      {layout.widgets.length === 0 ? (
        <div className="bg-muted/30 border-2 border-dashed rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Tableau de bord vide</h3>
            <p className="text-muted-foreground mb-4">Commencez par ajouter des widgets à votre tableau de bord</p>
            <Button onClick={() => setShowWidgetMenu(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier widget
            </Button>
          </div>
        </div>
      ) : (
        <div className={editMode ? "transition-opacity border-2 border-dashed border-primary/20 rounded-lg" : ""}>
          <ResponsiveGridLayout
            className="layout"
            layouts={getGridLayout()}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: settings.columns, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={settings.rowHeight}
            isDraggable={editMode}
            isResizable={editMode}
            compactType={settings.compactType}
            preventCollision={settings.preventCollision}
            onLayoutChange={(layout) => onLayoutChange(layout)}
            margin={[16, 16]}
          >
            {layout.widgets
              .filter((widget) => widget.visible)
              .map((widget) => (
                <div key={widget.position.i}>
                  <Widget
                    widget={widget}
                    editMode={editMode}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                  />
                </div>
              ))}
          </ResponsiveGridLayout>
        </div>
      )}

      {/* Barre d'outils en mode édition */}
      {editMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowWidgetMenu(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>

          <Button variant="outline" onClick={() => handleResetDashboard()} className="text-destructive">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>

          <Button onClick={() => setEditMode(false)}>Terminer</Button>
        </div>
      )}

      {/* Menu d'ajout de widgets */}
      <WidgetMenu open={showWidgetMenu} onClose={() => setShowWidgetMenu(false)} onAddWidget={handleAddWidget} />

      {/* Paramètres du tableau de bord */}
      <WidgetSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  )
}
