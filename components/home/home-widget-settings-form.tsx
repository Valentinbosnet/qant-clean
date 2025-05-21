"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface HomeWidgetSettingsFormProps {
  widget: HomeWidgetConfig
  onSubmit: (settings: any) => void
}

export function HomeWidgetSettingsForm({ widget, onSubmit }: HomeWidgetSettingsFormProps) {
  // Assurez-vous que settings est un objet
  const initialSettings = widget?.settings || {}

  // Créez une copie des paramètres pour éviter de modifier l'objet original
  const [settings, setSettings] = useState<Record<string, any>>({ ...initialSettings })
  const [title, setTitle] = useState(widget?.title || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      settings,
    })
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Rendu des champs de formulaire en fonction du type de widget
  const renderSettingsFields = () => {
    // Assurez-vous que widget.type est une chaîne de caractères
    const widgetType = String(widget?.type || "")

    switch (widgetType) {
      case "welcome":
        return (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showGetStarted">Afficher le bouton "Commencer"</Label>
                <Switch
                  id="showGetStarted"
                  checked={settings.showGetStarted !== false}
                  onCheckedChange={(checked) => updateSetting("showGetStarted", checked)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showSignup">Afficher les boutons d'inscription</Label>
                <Switch
                  id="showSignup"
                  checked={settings.showSignup === true}
                  onCheckedChange={(checked) => updateSetting("showSignup", checked)}
                />
              </div>
            </div>
          </>
        )

      case "quickActions":
      case "quick-actions":
        return (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showSearch">Recherche</Label>
                <Switch
                  id="showSearch"
                  checked={settings.showSearch !== false}
                  onCheckedChange={(checked) => updateSetting("showSearch", checked)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showFavorites">Favoris</Label>
                <Switch
                  id="showFavorites"
                  checked={settings.showFavorites !== false}
                  onCheckedChange={(checked) => updateSetting("showFavorites", checked)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showPredictions">Prédictions</Label>
                <Switch
                  id="showPredictions"
                  checked={settings.showPredictions !== false}
                  onCheckedChange={(checked) => updateSetting("showPredictions", checked)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showAlerts">Alertes</Label>
                <Switch
                  id="showAlerts"
                  checked={settings.showAlerts !== false}
                  onCheckedChange={(checked) => updateSetting("showAlerts", checked)}
                />
              </div>
            </div>
          </>
        )

      case "favorites":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxItems">Nombre maximum d'éléments</Label>
              <Input
                id="maxItems"
                type="number"
                min="1"
                max="10"
                value={settings.maxItems || 5}
                onChange={(e) => updateSetting("maxItems", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showChart">Afficher les graphiques</Label>
                <Switch
                  id="showChart"
                  checked={settings.showChart === true}
                  onCheckedChange={(checked) => updateSetting("showChart", checked)}
                />
              </div>
            </div>
          </>
        )

      case "marketOverview":
      case "market-overview":
        return (
          <>
            <div className="space-y-2">
              <Label>Indices à afficher</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSP500">S&P 500</Label>
                  <Switch
                    id="showSP500"
                    checked={!settings.indices || settings.indices.includes("S&P 500")}
                    onCheckedChange={(checked) => {
                      const indices = Array.isArray(settings.indices) ? [...settings.indices] : []
                      if (checked && !indices.includes("S&P 500")) {
                        indices.push("S&P 500")
                      } else if (!checked) {
                        const index = indices.indexOf("S&P 500")
                        if (index !== -1) indices.splice(index, 1)
                      }
                      updateSetting("indices", indices)
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showNasdaq">Nasdaq</Label>
                  <Switch
                    id="showNasdaq"
                    checked={!settings.indices || settings.indices.includes("NASDAQ")}
                    onCheckedChange={(checked) => {
                      const indices = Array.isArray(settings.indices) ? [...settings.indices] : []
                      if (checked && !indices.includes("NASDAQ")) {
                        indices.push("NASDAQ")
                      } else if (!checked) {
                        const index = indices.indexOf("NASDAQ")
                        if (index !== -1) indices.splice(index, 1)
                      }
                      updateSetting("indices", indices)
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDow">Dow Jones</Label>
                  <Switch
                    id="showDow"
                    checked={!settings.indices || settings.indices.includes("DOW")}
                    onCheckedChange={(checked) => {
                      const indices = Array.isArray(settings.indices) ? [...settings.indices] : []
                      if (checked && !indices.includes("DOW")) {
                        indices.push("DOW")
                      } else if (!checked) {
                        const index = indices.indexOf("DOW")
                        if (index !== -1) indices.splice(index, 1)
                      }
                      updateSetting("indices", indices)
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showRussell">Russell 2000</Label>
                  <Switch
                    id="showRussell"
                    checked={!settings.indices || settings.indices.includes("RUSSELL 2000")}
                    onCheckedChange={(checked) => {
                      const indices = Array.isArray(settings.indices) ? [...settings.indices] : []
                      if (checked && !indices.includes("RUSSELL 2000")) {
                        indices.push("RUSSELL 2000")
                      } else if (!checked) {
                        const index = indices.indexOf("RUSSELL 2000")
                        if (index !== -1) indices.splice(index, 1)
                      }
                      updateSetting("indices", indices)
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )

      case "news":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxItems">Nombre maximum d'articles</Label>
              <Input
                id="maxItems"
                type="number"
                min="1"
                max="10"
                value={settings.maxItems || 5}
                onChange={(e) => updateSetting("maxItems", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={settings.category || "business"}
                onValueChange={(value) => updateSetting("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technology">Technologie</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "recentActivity":
      case "recent-activity":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxItems">Nombre maximum d'activités</Label>
              <Input
                id="maxItems"
                type="number"
                min="1"
                max="10"
                value={settings.maxItems || 5}
                onChange={(e) => updateSetting("maxItems", Number.parseInt(e.target.value))}
              />
            </div>
          </>
        )

      case "predictionInsights":
      case "prediction-insights":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxItems">Nombre maximum de prédictions</Label>
              <Input
                id="maxItems"
                type="number"
                min="1"
                max="10"
                value={settings.maxItems || 4}
                onChange={(e) => updateSetting("maxItems", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="predictionMode">Mode de prédiction</Label>
              <Select
                value={settings.predictionMode || "lightweight"}
                onValueChange={(value) => updateSetting("predictionMode", value)}
              >
                <SelectTrigger id="predictionMode">
                  <SelectValue placeholder="Sélectionner un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lightweight">Léger</SelectItem>
                  <SelectItem value="enhanced">Amélioré</SelectItem>
                  <SelectItem value="sector">Sectoriel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "stockHighlights":
      case "stock-highlights":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxItems">Nombre maximum d'actions par catégorie</Label>
              <Input
                id="maxItems"
                type="number"
                min="1"
                max="5"
                value={settings.maxItems || 3}
                onChange={(e) => updateSetting("maxItems", Number.parseInt(e.target.value))}
              />
            </div>
          </>
        )

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucun paramètre disponible pour ce type de widget.</p>
          </div>
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="specific">Spécifique</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du widget</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du widget" />
          </div>
        </TabsContent>
        <TabsContent value="specific" className="space-y-4 pt-4">
          {renderSettingsFields()}
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Enregistrer
      </Button>
    </form>
  )
}
