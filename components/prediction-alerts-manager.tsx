"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  BellPlus,
  Check,
  Clock,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Settings,
  TrendingUp,
  BarChart2,
  Target,
  Percent,
} from "lucide-react"
import {
  predictionAlertsService,
  type PredictionAlert,
  type PredictionAlertCondition,
} from "@/lib/prediction-alerts-service"
import { alertsService } from "@/lib/alerts-service"
import type { StockData } from "@/lib/stock-service"
import type { PredictionResult } from "@/lib/prediction-service"
import type { EnhancedPredictionResult } from "@/lib/enhanced-prediction-service"

interface PredictionAlertsManagerProps {
  stock: StockData
  prediction?: PredictionResult | EnhancedPredictionResult
  userId?: string
}

export function PredictionAlertsManager({ stock, prediction, userId }: PredictionAlertsManagerProps) {
  const [alerts, setAlerts] = useState<PredictionAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<PredictionAlert[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAlert, setNewAlert] = useState<Partial<PredictionAlertCondition>>({
    type: "price-target",
    threshold: 10,
    direction: "above",
    timeframe: "medium",
  })
  const [alertMessage, setAlertMessage] = useState("")
  const { toast } = useToast()

  // Charger les alertes existantes
  useEffect(() => {
    loadAlerts()
  }, [stock.symbol])

  // Générer des suggestions lorsque la prédiction change
  useEffect(() => {
    if (prediction) {
      const newSuggestions = predictionAlertsService.generateAlertSuggestions(stock, prediction)
      setSuggestions(newSuggestions)
    }
  }, [prediction, stock])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const allAlerts = await alertsService.getAlerts(userId)

      // Filtrer les alertes pour ce symbole et de type prédiction
      const stockAlerts = allAlerts.filter((alert) => alert.symbol === stock.symbol && alert.type === "prediction")

      // Convertir en PredictionAlert (avec des valeurs par défaut pour les propriétés manquantes)
      const predictionAlerts: PredictionAlert[] = stockAlerts.map((alert) => ({
        ...alert,
        predictionCondition: {
          type: "price-target",
          threshold: alert.value,
          direction: "above",
          timeframe: "medium",
        },
      }))

      setAlerts(predictionAlerts)
    } catch (error) {
      console.error("Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAlert = async () => {
    try {
      if (!newAlert.type || !newAlert.threshold || !newAlert.direction || !newAlert.timeframe) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        })
        return
      }

      if (!prediction) {
        toast({
          title: "Erreur",
          description: "Aucune prédiction disponible pour créer une alerte",
          variant: "destructive",
        })
        return
      }

      const condition: PredictionAlertCondition = {
        type: newAlert.type,
        threshold: newAlert.threshold,
        direction: newAlert.direction,
        timeframe: newAlert.timeframe,
      } as PredictionAlertCondition

      const alert = await predictionAlertsService.createPredictionAlert(stock, prediction, condition, userId)
      setAlerts([...alerts, alert])
      setShowAddDialog(false)
      toast({
        title: "Alerte créée",
        description: "L'alerte de prédiction a été créée avec succès",
        variant: "success",
      })

      // Réinitialiser le formulaire
      setNewAlert({
        type: "price-target",
        threshold: 10,
        direction: "above",
        timeframe: "medium",
      })
    } catch (error) {
      console.error("Error adding alert:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'alerte",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAlert = async (id: string) => {
    try {
      await alertsService.deleteAlert(id)
      setAlerts(alerts.filter((alert) => alert.id !== id))
      toast({
        title: "Alerte supprimée",
        description: "L'alerte a été supprimée avec succès",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting alert:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'alerte",
        variant: "destructive",
      })
    }
  }

  const handleAddSuggestion = async (suggestion: PredictionAlert) => {
    try {
      if (!prediction) {
        toast({
          title: "Erreur",
          description: "Aucune prédiction disponible pour créer une alerte",
          variant: "destructive",
        })
        return
      }

      // Créer une nouvelle alerte basée sur la suggestion
      const alert = await predictionAlertsService.createPredictionAlert(
        stock,
        prediction,
        suggestion.predictionCondition,
        userId,
      )

      setAlerts([...alerts, alert])
      toast({
        title: "Alerte créée",
        description: "L'alerte suggérée a été ajoutée avec succès",
        variant: "success",
      })
    } catch (error) {
      console.error("Error adding suggestion:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la suggestion",
        variant: "destructive",
      })
    }
  }

  // Générer un message d'alerte en fonction des paramètres sélectionnés
  const generateAlertMessage = () => {
    if (!newAlert.type || !newAlert.threshold || !newAlert.direction || !newAlert.timeframe) {
      return ""
    }

    const { type, threshold, direction, timeframe } = newAlert
    const timeframeText = timeframe === "short" ? "court terme" : timeframe === "medium" ? "moyen terme" : "long terme"

    switch (type) {
      case "price-target":
        return `${stock.symbol} pourrait ${
          direction === "above" ? "augmenter de" : direction === "below" ? "baisser de" : "varier de"
        } ${threshold}% à ${timeframeText} selon les prédictions`

      case "trend-change":
        return `Tendance ${
          direction === "above" ? "haussière" : direction === "below" ? "baissière" : "changeante"
        } prédite pour ${stock.symbol} à ${timeframeText}`

      case "volatility":
        return `Volatilité ${
          direction === "above" ? "élevée" : "faible"
        } prédite pour ${stock.symbol} (seuil: ${threshold}%)`

      case "confidence":
        return `Prédiction à ${
          direction === "above" ? "haute" : "faible"
        } confiance (${threshold}%) pour ${stock.symbol}`

      case "sector-trend":
        return `Tendance sectorielle ${direction === "above" ? "positive" : "négative"} pour ${stock.symbol}`

      case "custom":
        return `Alerte personnalisée pour ${stock.symbol}: seuil de ${threshold}% ${
          direction === "above" ? "dépassé" : "non atteint"
        }`

      default:
        return `Alerte de prédiction pour ${stock.symbol}`
    }
  }

  // Mettre à jour le message lorsque les paramètres changent
  useEffect(() => {
    setAlertMessage(generateAlertMessage())
  }, [newAlert])

  // Obtenir l'icône pour le type d'alerte
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "price-target":
        return <Target className="h-4 w-4" />
      case "trend-change":
        return <TrendingUp className="h-4 w-4" />
      case "volatility":
        return <BarChart2 className="h-4 w-4" />
      case "confidence":
        return <Percent className="h-4 w-4" />
      case "sector-trend":
        return <TrendingUp className="h-4 w-4" />
      case "custom":
        return <Settings className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Obtenir le libellé pour le type d'alerte
  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "price-target":
        return "Objectif de prix"
      case "trend-change":
        return "Changement de tendance"
      case "volatility":
        return "Volatilité"
      case "confidence":
        return "Confiance"
      case "sector-trend":
        return "Tendance sectorielle"
      case "custom":
        return "Personnalisée"
      default:
        return type
    }
  }

  // Obtenir le libellé pour la direction
  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case "above":
        return "Au-dessus de"
      case "below":
        return "En-dessous de"
      case "change":
        return "Changement de"
      default:
        return direction
    }
  }

  // Obtenir le libellé pour le timeframe
  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case "short":
        return "Court terme (7 jours)"
      case "medium":
        return "Moyen terme (30 jours)"
      case "long":
        return "Long terme (90 jours)"
      default:
        return timeframe
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Alertes de prédiction</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <BellPlus className="h-4 w-4 mr-2" />
            Nouvelle alerte
          </Button>
        </div>
        <CardDescription>
          Recevez des notifications lorsque des prédictions significatives sont détectées
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-14 w-full animate-pulse bg-muted rounded-md"></div>
            <div className="h-14 w-full animate-pulse bg-muted rounded-md"></div>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Actives{" "}
                <Badge variant="secondary" className="ml-1">
                  {alerts.filter((a) => !a.triggered).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                Suggestions{" "}
                <Badge variant="secondary" className="ml-1">
                  {suggestions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history">
                Historique{" "}
                <Badge variant="secondary" className="ml-1">
                  {alerts.filter((a) => a.triggered).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {alerts.filter((a) => !a.triggered).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune alerte active</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une alerte
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[220px]">
                  <div className="space-y-2">
                    {alerts
                      .filter((a) => !a.triggered)
                      .map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 flex items-center gap-1">
                                {getAlertTypeIcon(alert.predictionCondition.type)}
                                {getAlertTypeLabel(alert.predictionCondition.type)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getDirectionLabel(alert.predictionCondition.direction)}{" "}
                                {alert.predictionCondition.threshold}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                            {alert.expires && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                Expire le {new Date(alert.expires).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="suggestions">
              {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune suggestion disponible</p>
                </div>
              ) : (
                <ScrollArea className="h-[220px]">
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 flex items-center gap-1">
                              {getAlertTypeIcon(suggestion.predictionCondition.type)}
                              {getAlertTypeLabel(suggestion.predictionCondition.type)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {getDirectionLabel(suggestion.predictionCondition.direction)}{" "}
                              {suggestion.predictionCondition.threshold}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestion.message}</p>
                          {suggestion.expires && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Expire le {new Date(suggestion.expires).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSuggestion(suggestion)}
                          className="ml-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="history">
              {alerts.filter((a) => a.triggered).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune alerte dans l'historique</p>
                </div>
              ) : (
                <ScrollArea className="h-[220px]">
                  <div className="space-y-2">
                    {alerts
                      .filter((a) => a.triggered)
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between p-3 rounded-md bg-muted opacity-70"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 opacity-70 flex items-center gap-1">
                                {getAlertTypeIcon(alert.predictionCondition.type)}
                                {getAlertTypeLabel(alert.predictionCondition.type)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getDirectionLabel(alert.predictionCondition.direction)}{" "}
                                {alert.predictionCondition.threshold}%
                              </span>
                              <Badge variant="success" className="ml-2">
                                <Check className="h-3 w-3 mr-1" />
                                Déclenchée
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Dialogue d'ajout d'alerte */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une alerte de prédiction</DialogTitle>
              <DialogDescription>
                Configurez les paramètres de votre alerte de prédiction pour {stock.symbol}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-type" className="text-right">
                  Type d'alerte
                </Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) => setNewAlert({ ...newAlert, type: value as any })}
                >
                  <SelectTrigger id="alert-type" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-target">Objectif de prix</SelectItem>
                    <SelectItem value="trend-change">Changement de tendance</SelectItem>
                    <SelectItem value="volatility">Volatilité</SelectItem>
                    <SelectItem value="confidence">Confiance</SelectItem>
                    <SelectItem value="sector-trend">Tendance sectorielle</SelectItem>
                    <SelectItem value="custom">Personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-direction" className="text-right">
                  Direction
                </Label>
                <Select
                  value={newAlert.direction}
                  onValueChange={(value) => setNewAlert({ ...newAlert, direction: value as any })}
                >
                  <SelectTrigger id="alert-direction" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Au-dessus de</SelectItem>
                    <SelectItem value="below">En-dessous de</SelectItem>
                    <SelectItem value="change">Changement de</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-threshold" className="text-right">
                  Seuil (%)
                </Label>
                <div className="col-span-3 flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <Slider
                      id="alert-threshold"
                      min={1}
                      max={50}
                      step={1}
                      value={[newAlert.threshold || 10]}
                      onValueChange={(value) => setNewAlert({ ...newAlert, threshold: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{newAlert.threshold || 10}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {newAlert.type === "price-target" && "Pourcentage de variation du prix prédit"}
                    {newAlert.type === "trend-change" && "Force minimale du changement de tendance"}
                    {newAlert.type === "volatility" && "Niveau de volatilité prédit"}
                    {newAlert.type === "confidence" && "Niveau de confiance minimal de la prédiction"}
                    {newAlert.type === "sector-trend" && "Force de la tendance sectorielle"}
                    {newAlert.type === "custom" && "Seuil personnalisé"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-timeframe" className="text-right">
                  Horizon
                </Label>
                <Select
                  value={newAlert.timeframe}
                  onValueChange={(value) => setNewAlert({ ...newAlert, timeframe: value as any })}
                >
                  <SelectTrigger id="alert-timeframe" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Court terme (7 jours)</SelectItem>
                    <SelectItem value="medium">Moyen terme (30 jours)</SelectItem>
                    <SelectItem value="long">Long terme (90 jours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Message</Label>
                <div className="col-span-3 p-3 bg-muted rounded-md text-sm">
                  {alertMessage || "Configurez les paramètres pour générer un message"}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddAlert}>
                <Save className="h-4 w-4 mr-2" />
                Créer l'alerte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={loadAlerts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/alerts">
            <Settings className="h-4 w-4 mr-2" />
            Gérer toutes les alertes
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
