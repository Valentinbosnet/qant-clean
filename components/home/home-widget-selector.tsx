"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Clock,
  Newspaper,
  BarChart3,
  Lightbulb,
  Award,
  LineChart,
  Home,
} from "lucide-react"

interface HomeWidgetSelectorProps {
  open: boolean
  onClose: () => void
  onAddWidget: (type: string, title: string, settings: any) => Promise<boolean>
}

export function HomeWidgetSelector({ open, onClose, onAddWidget }: HomeWidgetSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [widgetTitle, setWidgetTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Liste des widgets disponibles
  const availableWidgets = [
    {
      type: "welcome",
      title: "Bienvenue",
      description: "Widget d'accueil personnalisé",
      icon: <Home className="h-5 w-5" />,
      defaultSettings: {
        userName: "",
        showGetStarted: true,
        showSignup: true,
      },
    },
    {
      type: "quick-actions",
      title: "Actions rapides",
      description: "Accès rapide aux fonctionnalités principales",
      icon: <LayoutDashboard className="h-5 w-5" />,
      defaultSettings: {
        showSearch: true,
        showFavorites: true,
        showAlerts: true,
        showPredictions: true,
      },
    },
    {
      type: "favorites",
      title: "Favoris",
      description: "Vos actions favorites",
      icon: <Star className="h-5 w-5" />,
      defaultSettings: {
        maxItems: 5,
        showChart: true,
        showPrediction: true,
      },
    },
    {
      type: "market-overview",
      title: "Aperçu du marché",
      description: "Vue d'ensemble des principaux indices",
      icon: <TrendingUp className="h-5 w-5" />,
      defaultSettings: {
        indices: ["S&P 500", "NASDAQ", "DOW", "RUSSELL 2000"],
        showChange: true,
        showPercentage: true,
      },
    },
    {
      type: "recent-activity",
      title: "Activité récente",
      description: "Historique de vos dernières actions",
      icon: <Clock className="h-5 w-5" />,
      defaultSettings: {
        maxItems: 5,
        showTimestamp: true,
        types: ["search", "favorite", "alert"],
      },
    },
    {
      type: "news",
      title: "Actualités",
      description: "Dernières nouvelles financières",
      icon: <Newspaper className="h-5 w-5" />,
      defaultSettings: {
        maxItems: 5,
        showSource: true,
        showTimestamp: true,
        categories: ["general", "business", "technology"],
      },
    },
    {
      type: "performance",
      title: "Performance",
      description: "Performance de vos investissements",
      icon: <BarChart3 className="h-5 w-5" />,
      defaultSettings: {
        period: "1M",
        showChart: true,
        showStats: true,
      },
    },
    {
      type: "features",
      title: "Fonctionnalités",
      description: "Découvrez les fonctionnalités de la plateforme",
      icon: <Lightbulb className="h-5 w-5" />,
      defaultSettings: {
        maxItems: 4,
        showIcons: true,
        features: ["search", "predictions", "alerts", "portfolio"],
      },
    },
    {
      type: "stock-highlights",
      title: "Faits saillants",
      description: "Actions les plus performantes",
      icon: <Award className="h-5 w-5" />,
      defaultSettings: {
        categories: ["gainers", "losers", "active"],
        maxItems: 3,
        showChange: true,
      },
    },
    {
      type: "prediction-insights",
      title: "Prédictions",
      description: "Aperçu des prédictions IA",
      icon: <LineChart className="h-5 w-5" />,
      defaultSettings: {
        maxItems: 3,
        showConfidence: true,
        predictionMode: "lightweight",
      },
    },
  ]

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedType(null)
    setWidgetTitle("")
    setIsAdding(false)
  }

  // Fermer le dialogue
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Ajouter le widget
  const handleAddWidget = async () => {
    if (!selectedType) return

    setIsAdding(true)
    try {
      const widget = availableWidgets.find((w) => w.type === selectedType)
      if (!widget) return

      const title = widgetTitle || widget.title
      const success = await onAddWidget(widget.type, title, widget.defaultSettings)

      if (success) {
        handleClose()
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un widget</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="data">Données</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="tools">Outils</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets.map((widget) => (
                <Card
                  key={widget.type}
                  className={`cursor-pointer transition-all ${
                    selectedType === widget.type
                      ? "border-primary ring-2 ring-primary ring-opacity-50"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedType(widget.type)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">{widget.icon}</div>
                    </div>
                    <CardTitle className="text-lg mt-2">{widget.title}</CardTitle>
                    <CardDescription>{widget.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets
                .filter((w) => ["favorites", "market-overview", "performance", "stock-highlights"].includes(w.type))
                .map((widget) => (
                  <Card
                    key={widget.type}
                    className={`cursor-pointer transition-all ${
                      selectedType === widget.type
                        ? "border-primary ring-2 ring-primary ring-opacity-50"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedType(widget.type)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">{widget.icon}</div>
                      </div>
                      <CardTitle className="text-lg mt-2">{widget.title}</CardTitle>
                      <CardDescription>{widget.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets
                .filter((w) => ["welcome", "news", "features", "prediction-insights"].includes(w.type))
                .map((widget) => (
                  <Card
                    key={widget.type}
                    className={`cursor-pointer transition-all ${
                      selectedType === widget.type
                        ? "border-primary ring-2 ring-primary ring-opacity-50"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedType(widget.type)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">{widget.icon}</div>
                      </div>
                      <CardTitle className="text-lg mt-2">{widget.title}</CardTitle>
                      <CardDescription>{widget.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets
                .filter((w) => ["quick-actions", "recent-activity"].includes(w.type))
                .map((widget) => (
                  <Card
                    key={widget.type}
                    className={`cursor-pointer transition-all ${
                      selectedType === widget.type
                        ? "border-primary ring-2 ring-primary ring-opacity-50"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedType(widget.type)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">{widget.icon}</div>
                      </div>
                      <CardTitle className="text-lg mt-2">{widget.title}</CardTitle>
                      <CardDescription>{widget.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedType && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="widget-title">Titre du widget</Label>
                <Input
                  id="widget-title"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder={availableWidgets.find((w) => w.type === selectedType)?.title}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleAddWidget} disabled={!selectedType || isAdding}>
            {isAdding ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
