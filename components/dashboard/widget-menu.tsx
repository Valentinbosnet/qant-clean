"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Star, LineChart, BarChart3, Newspaper, Layers, PieChart } from "lucide-react"
import "@/styles/widget-animations.css"

interface WidgetMenuProps {
  open: boolean
  onClose: () => void
  onAddWidget: (type: string, title: string, settings: any) => Promise<boolean>
}

interface WidgetTypeInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  defaultSettings: any
  defaultTitle: string
  category: string
}

// Liste des types de widgets disponibles
const availableWidgets: WidgetTypeInfo[] = [
  {
    id: "prediction",
    name: "Prédictions",
    description: "Affiche les prédictions pour une action donnée",
    icon: <TrendingUp className="h-5 w-5" />,
    defaultSettings: { symbol: "AAPL", days: 30 },
    defaultTitle: "Prédictions",
    category: "stocks",
  },
  {
    id: "favorites",
    name: "Favoris",
    description: "Liste de vos actions favorites",
    icon: <Star className="h-5 w-5" />,
    defaultSettings: { limit: 5 },
    defaultTitle: "Mes Favoris",
    category: "stocks",
  },
  {
    id: "market",
    name: "Aperçu du Marché",
    description: "Vue d'ensemble des indices et marchés boursiers",
    icon: <LineChart className="h-5 w-5" />,
    defaultSettings: { showChart: true },
    defaultTitle: "Aperçu du Marché",
    category: "market",
  },
  {
    id: "stock",
    name: "Action",
    description: "Informations détaillées sur une action spécifique",
    icon: <BarChart3 className="h-5 w-5" />,
    defaultSettings: { symbol: "GOOGL" },
    defaultTitle: "Actions Google",
    category: "stocks",
  },
  {
    id: "news",
    name: "Actualités",
    description: "Dernières nouvelles du monde financier",
    icon: <Newspaper className="h-5 w-5" />,
    defaultSettings: { category: "business", count: 5 },
    defaultTitle: "Actualités Financières",
    category: "news",
  },
  {
    id: "sector",
    name: "Secteurs",
    description: "Performance par secteurs économiques",
    icon: <Layers className="h-5 w-5" />,
    defaultSettings: { sector: "technology" },
    defaultTitle: "Performance des Secteurs",
    category: "market",
  },
  {
    id: "performance",
    name: "Performance",
    description: "Analyse de la performance de votre portefeuille",
    icon: <PieChart className="h-5 w-5" />,
    defaultSettings: { period: "month" },
    defaultTitle: "Performance du Portefeuille",
    category: "portfolio",
  },
]

export function WidgetMenu({ open, onClose, onAddWidget }: WidgetMenuProps) {
  const [search, setSearch] = useState("")
  const [selectedWidget, setSelectedWidget] = useState<WidgetTypeInfo | null>(null)
  const [widgetTitle, setWidgetTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)
  // Remove this line:
  // const dialogRef = useRef<HTMLDivElement>(null)

  // Animation d'entrée pour les éléments
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setAnimateItems(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimateItems(false)
    }
  }, [open])

  const filteredWidgets = availableWidgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(search.toLowerCase()) ||
      widget.description.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelectWidget = (widget: WidgetTypeInfo) => {
    setSelectedWidget(widget)
    setWidgetTitle(widget.defaultTitle)
  }

  const handleAddWidget = async () => {
    if (!selectedWidget) return

    setIsAdding(true)
    try {
      const success = await onAddWidget(
        selectedWidget.id,
        widgetTitle || selectedWidget.defaultTitle,
        selectedWidget.defaultSettings,
      )

      if (success) {
        // Réinitialiser l'état et fermer le menu
        setSelectedWidget(null)
        setWidgetTitle("")
        setSearch("")
        onClose()
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setSelectedWidget(null)
    setWidgetTitle("")
    setSearch("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Fix the DialogContent component by removing the ref: */}
      <DialogContent className="max-w-3xl w-[90vw] fade-in">
        <DialogHeader>
          <DialogTitle>Ajouter un widget</DialogTitle>
        </DialogHeader>

        {!selectedWidget ? (
          <>
            <Input
              placeholder="Rechercher un widget..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="my-2 transition-all duration-200 focus:scale-[1.01]"
            />

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="stocks">Actions</TabsTrigger>
                <TabsTrigger value="market">Marché</TabsTrigger>
                <TabsTrigger value="portfolio">Portefeuille</TabsTrigger>
                <TabsTrigger value="news">Actualités</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <WidgetGrid widgets={filteredWidgets} onSelect={handleSelectWidget} animateItems={animateItems} />
              </TabsContent>

              <TabsContent value="stocks">
                <WidgetGrid
                  widgets={filteredWidgets.filter((w) => w.category === "stocks")}
                  onSelect={handleSelectWidget}
                  animateItems={animateItems}
                />
              </TabsContent>

              <TabsContent value="market">
                <WidgetGrid
                  widgets={filteredWidgets.filter((w) => w.category === "market")}
                  onSelect={handleSelectWidget}
                  animateItems={animateItems}
                />
              </TabsContent>

              <TabsContent value="portfolio">
                <WidgetGrid
                  widgets={filteredWidgets.filter((w) => w.category === "portfolio")}
                  onSelect={handleSelectWidget}
                  animateItems={animateItems}
                />
              </TabsContent>

              <TabsContent value="news">
                <WidgetGrid
                  widgets={filteredWidgets.filter((w) => w.category === "news")}
                  onSelect={handleSelectWidget}
                  animateItems={animateItems}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div
            className={`space-y-4 transition-all duration-300 ${animateItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="bg-primary/10 p-2 rounded-full">{selectedWidget.icon}</div>
              <div>
                <h3 className="font-medium">{selectedWidget.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedWidget.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="widget-title" className="text-sm font-medium">
                Titre du widget
              </label>
              <Input
                id="widget-title"
                placeholder="Titre personnalisé"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={isAdding}>
                Annuler
              </Button>
              <Button
                onClick={handleAddWidget}
                disabled={isAdding}
                className="transition-all duration-200 hover:scale-105"
              >
                {isAdding ? "Ajout en cours..." : "Ajouter le widget"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function WidgetGrid({
  widgets,
  onSelect,
  animateItems,
}: {
  widgets: WidgetTypeInfo[]
  onSelect: (widget: WidgetTypeInfo) => void
  animateItems: boolean
}) {
  if (widgets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun widget trouvé</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget, index) => (
          <Button
            key={widget.id}
            variant="outline"
            className={`h-auto p-4 justify-start gap-3 hover:bg-muted transition-all duration-300 ${
              animateItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
            onClick={() => onSelect(widget)}
          >
            <div className="bg-primary/10 p-2 rounded-full">{widget.icon}</div>
            <div className="text-left">
              <h3 className="font-medium">{widget.name}</h3>
              <p className="text-sm text-muted-foreground">{widget.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
