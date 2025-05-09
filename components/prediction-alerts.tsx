"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, BellPlus, Check, Clock, DollarSign, Plus, RefreshCw, Save, Trash2, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { alertsService, type PriceAlert, generateAlertSuggestions } from "@/lib/alerts-service"
import type { StockData } from "@/lib/stock-service"
import type { EnhancedPredictionResult } from "@/lib/enhanced-prediction-service"
import { formatPrice } from "@/lib/utils"

interface PredictionAlertsProps {
  stock: StockData
  prediction?: EnhancedPredictionResult
}

export function PredictionAlerts({ stock, prediction }: PredictionAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Omit<PriceAlert, "id" | "created">[]>([])
  const [newAlert, setNewAlert] = useState<Partial<Omit<PriceAlert, "id" | "created">>>({
    symbol: stock.symbol,
    type: "price",
    condition: "above",
    value: stock.price * 1.05, // 5% au-dessus du prix actuel
    message: `${stock.symbol} a dépassé le prix cible`,
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { toast } = useToast()

  // Charger les alertes existantes
  useEffect(() => {
    loadAlerts()
  }, [stock.symbol])

  // Générer des suggestions lorsque la prédiction change
  useEffect(() => {
    if (prediction) {
      setSuggestions(generateAlertSuggestions(stock, prediction))
    }
  }, [prediction, stock])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const allAlerts = await alertsService.getAlerts()
      const stockAlerts = allAlerts.filter((alert) => alert.symbol === stock.symbol)
      setAlerts(stockAlerts)
    } catch (error) {
      console.error("Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAlert = async () => {
    try {
      if (!newAlert.value || !newAlert.message) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        })
        return
      }

      const alert = await alertsService.createPriceAlert(newAlert as Omit<PriceAlert, "id" | "created">)
      setAlerts([...alerts, alert])
      setShowAddDialog(false)
      toast({
        title: "Alerte créée",
        description: "L'alerte a été créée avec succès",
        variant: "success",
      })

      // Réinitialiser le formulaire
      setNewAlert({
        symbol: stock.symbol,
        type: "price",
        condition: "above",
        value: stock.price * 1.05,
        message: `${stock.symbol} a dépassé le prix cible`,
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

  const handleAddSuggestion = async (suggestion: Omit<PriceAlert, "id" | "created">) => {
    try {
      const alert = await alertsService.createPriceAlert(suggestion)
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

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "price":
        return "Prix"
      case "prediction":
        return "Prédiction"
      case "technical":
        return "Technique"
      case "custom":
        return "Personnalisée"
      default:
        return type
    }
  }

  const getAlertConditionLabel = (condition: string) => {
    switch (condition) {
      case "above":
        return "Au-dessus de"
      case "below":
        return "En-dessous de"
      case "change":
        return "Variation de"
      case "prediction":
        return "Prédiction de"
      case "technical":
        return "Signal technique"
      default:
        return condition
    }
  }

  const getAlertValueLabel = (alert: PriceAlert) => {
    switch (alert.condition) {
      case "above":
      case "below":
        return formatPrice(alert.value)
      case "change":
      case "prediction":
        return `${alert.value}%`
      case "technical":
        return alert.value > 0 ? "Haussier" : "Baissier"
      default:
        return alert.value.toString()
    }
  }

  // Mettre à jour le message en fonction du type et de la condition
  const updateAlertMessage = () => {
    if (!newAlert.symbol || !newAlert.type || !newAlert.condition) return

    let message = `${newAlert.symbol} `

    switch (newAlert.condition) {
      case "above":
        message += `a dépassé ${formatPrice(newAlert.value || 0)}`
        break
      case "below":
        message += `est passé sous ${formatPrice(newAlert.value || 0)}`
        break
      case "change":
        message += `a varié de plus de ${newAlert.value || 0}%`
        break
      case "prediction":
        message += `pourrait ${(newAlert.value || 0) > 0 ? "augmenter" : "baisser"} de ${Math.abs(newAlert.value || 0)}% selon les prédictions`
        break
      case "technical":
        message += `montre un fort signal technique ${(newAlert.value || 0) > 0 ? "haussier" : "baissier"}`
        break
    }

    setNewAlert({ ...newAlert, message })
  }

  // Mettre à jour le message lorsque le type, la condition ou la valeur change
  useEffect(() => {
    updateAlertMessage()
  }, [newAlert.type, newAlert.condition, newAlert.value])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Alertes de prix</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <BellPlus className="h-4 w-4 mr-2" />
            Nouvelle
          </Button>
        </div>
        <CardDescription>Recevez des notifications lorsque des conditions spécifiques sont remplies</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
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
                              <Badge variant="outline" className="mr-2">
                                {getAlertTypeLabel(alert.type)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getAlertConditionLabel(alert.condition)} {getAlertValueLabel(alert)}
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
                            <Badge variant="outline" className="mr-2">
                              {getAlertTypeLabel(suggestion.type)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {getAlertConditionLabel(suggestion.condition)} {suggestion.value}
                              {suggestion.condition === "prediction" || suggestion.condition === "change" ? "%" : ""}
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
                          onClick={() => handleAddSuggestion(suggestion as Omit<PriceAlert, "id" | "created">)}
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
                              <Badge variant="outline" className="mr-2 opacity-70">
                                {getAlertTypeLabel(alert.type)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getAlertConditionLabel(alert.condition)} {getAlertValueLabel(alert)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle alerte</DialogTitle>
              <DialogDescription>Configurez les paramètres de votre alerte pour {stock.symbol}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) => setNewAlert({ ...newAlert, type: value as any })}
                >
                  <SelectTrigger id="alert-type" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Prix</SelectItem>
                    <SelectItem value="prediction">Prédiction</SelectItem>
                    <SelectItem value="technical">Technique</SelectItem>
                    <SelectItem value="custom">Personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-condition" className="text-right">
                  Condition
                </Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(value) => setNewAlert({ ...newAlert, condition: value as any })}
                >
                  <SelectTrigger id="alert-condition" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {newAlert.type === "price" && (
                      <>
                        <SelectItem value="above">Au-dessus de</SelectItem>
                        <SelectItem value="below">En-dessous de</SelectItem>
                        <SelectItem value="change">Variation de</SelectItem>
                      </>
                    )}
                    {newAlert.type === "prediction" && <SelectItem value="prediction">Prédiction de</SelectItem>}
                    {newAlert.type === "technical" && <SelectItem value="technical">Signal technique</SelectItem>}
                    {newAlert.type === "custom" && (
                      <>
                        <SelectItem value="above">Au-dessus de</SelectItem>
                        <SelectItem value="below">En-dessous de</SelectItem>
                        <SelectItem value="change">Variation de</SelectItem>
                        <SelectItem value="prediction">Prédiction de</SelectItem>
                        <SelectItem value="technical">Signal technique</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-value" className="text-right">
                  Valeur
                </Label>
                <div className="col-span-3 flex items-center">
                  {newAlert.condition === "technical" ? (
                    <Select
                      value={newAlert.value?.toString()}
                      onValueChange={(value) => setNewAlert({ ...newAlert, value: Number(value) })}
                    >
                      <SelectTrigger id="trend-value" className="w-full">
                        <SelectValue placeholder="Sélectionnez une tendance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.7">Haussier (fort)</SelectItem>
                        <SelectItem value="-0.7">Baissier (fort)</SelectItem>
                        <SelectItem value="0.5">Haussier (modéré)</SelectItem>
                        <SelectItem value="-0.5">Baissier (modéré)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <>
                      <Input
                        id="alert-value"
                        type="number"
                        step={newAlert.condition === "change" || newAlert.condition === "prediction" ? "0.1" : "0.01"}
                        value={newAlert.value || ""}
                        onChange={(e) => setNewAlert({ ...newAlert, value: Number(e.target.value) })}
                        className="flex-1"
                      />
                      {(newAlert.condition === "change" || newAlert.condition === "prediction") && (
                        <span className="ml-2">%</span>
                      )}
                      {(newAlert.condition === "above" || newAlert.condition === "below") && (
                        <span className="ml-2">
                          <DollarSign className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-message" className="text-right">
                  Message
                </Label>
                <Input
                  id="alert-message"
                  value={newAlert.message || ""}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alert-expiry" className="text-right">
                  Expiration
                </Label>
                <Select
                  value={newAlert.expires ? new Date(newAlert.expires).toISOString() : ""}
                  onValueChange={(value) => {
                    const date = value ? new Date(value) : undefined
                    setNewAlert({ ...newAlert, expires: date })
                  }}
                  defaultValue="7days"
                >
                  <SelectTrigger id="alert-expiry" className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}>1 jour</SelectItem>
                    <SelectItem value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}>
                      7 jours
                    </SelectItem>
                    <SelectItem value={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}>
                      30 jours
                    </SelectItem>
                    <SelectItem value={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()}>
                      90 jours
                    </SelectItem>
                    <SelectItem value="never">Jamais</SelectItem>
                  </SelectContent>
                </Select>
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
