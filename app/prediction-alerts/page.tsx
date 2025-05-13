"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Clock, Search, Trash2, BellPlus, Filter } from "lucide-react"
import { alertsService } from "@/lib/alerts-service"
import type { PredictionAlert } from "@/lib/prediction-alerts-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PredictionAlertsPage() {
  const [alerts, setAlerts] = useState<PredictionAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const allAlerts = await alertsService.getAlerts()

      // Filtrer les alertes de type prédiction
      const predictionAlerts = allAlerts.filter((alert) => alert.type === "prediction")

      // Convertir en PredictionAlert (avec des valeurs par défaut pour les propriétés manquantes)
      const convertedAlerts: PredictionAlert[] = predictionAlerts.map((alert) => ({
        ...alert,
        predictionCondition: {
          type: "price-target", // Valeur par défaut
          threshold: alert.value,
          direction: "above", // Valeur par défaut
          timeframe: "medium", // Valeur par défaut
        },
      }))

      setAlerts(convertedAlerts)
    } catch (error) {
      console.error("Error loading alerts:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const handleDeleteAllTriggered = async () => {
    try {
      const triggeredAlerts = alerts.filter((alert) => alert.triggered)
      for (const alert of triggeredAlerts) {
        await alertsService.deleteAlert(alert.id)
      }
      setAlerts(alerts.filter((alert) => !alert.triggered))
      toast({
        title: "Alertes supprimées",
        description: `${triggeredAlerts.length} alertes déclenchées ont été supprimées`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting triggered alerts:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des alertes",
        variant: "destructive",
      })
    }
  }

  // Filtrer les alertes par terme de recherche et type
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      filterType === "all" || (alert.predictionCondition && alert.predictionCondition.type === filterType)

    return matchesSearch && matchesType
  })

  const activeAlerts = filteredAlerts.filter((alert) => !alert.triggered)
  const triggeredAlerts = filteredAlerts.filter((alert) => alert.triggered)

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
        return "Court terme"
      case "medium":
        return "Moyen terme"
      case "long":
        return "Long terme"
      default:
        return timeframe
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/market-predictions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Alertes de prédiction</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-background border border-input rounded-md px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="price-target">Objectif de prix</option>
              <option value="trend-change">Changement de tendance</option>
              <option value="volatility">Volatilité</option>
              <option value="confidence">Confiance</option>
              <option value="sector-trend">Tendance sectorielle</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>

          {triggeredAlerts.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAllTriggered}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer les alertes déclenchées ({triggeredAlerts.length})
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Alertes actives{" "}
            <Badge variant="secondary" className="ml-1">
              {activeAlerts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="triggered">
            Alertes déclenchées{" "}
            <Badge variant="secondary" className="ml-1">
              {triggeredAlerts.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Alertes actives</CardTitle>
              <CardDescription>{activeAlerts.length} alertes en attente de déclenchement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune alerte active</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/market-predictions">
                      <BellPlus className="h-4 w-4 mr-2" />
                      Créer une alerte
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbole</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Horizon</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          <Link href={`/market-predictions?symbol=${alert.symbol}`} className="hover:underline">
                            {alert.symbol}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getAlertTypeLabel(alert.predictionCondition.type)}</Badge>
                        </TableCell>
                        <TableCell>
                          {getDirectionLabel(alert.predictionCondition.direction)} {alert.predictionCondition.threshold}
                          %
                        </TableCell>
                        <TableCell>{getTimeframeLabel(alert.predictionCondition.timeframe)}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                        <TableCell>
                          {alert.expires ? (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {new Date(alert.expires).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Jamais</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggered">
          <Card>
            <CardHeader>
              <CardTitle>Alertes déclenchées</CardTitle>
              <CardDescription>{triggeredAlerts.length} alertes déjà déclenchées</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : triggeredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune alerte déclenchée</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbole</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {triggeredAlerts.map((alert) => (
                      <TableRow key={alert.id} className="opacity-70">
                        <TableCell className="font-medium">
                          <Link href={`/market-predictions?symbol=${alert.symbol}`} className="hover:underline">
                            {alert.symbol}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="opacity-70">
                            {getAlertTypeLabel(alert.predictionCondition.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getDirectionLabel(alert.predictionCondition.direction)} {alert.predictionCondition.threshold}
                          %
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            <Check className="h-3 w-3 mr-1" />
                            Déclenchée
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
