"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Clock, Search, Trash2 } from "lucide-react"
import { alertsService, type PriceAlert } from "@/lib/alerts-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const allAlerts = await alertsService.getAlerts()
      setAlerts(allAlerts)
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

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeAlerts = filteredAlerts.filter((alert) => !alert.triggered)
  const triggeredAlerts = filteredAlerts.filter((alert) => alert.triggered)

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gestion des alertes</h1>
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

          {triggeredAlerts.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAllTriggered}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer les alertes déclenchées ({triggeredAlerts.length})
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-8">
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
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbole</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.symbol}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {getAlertConditionLabel(alert.condition)} {getAlertValueLabel(alert)}
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>Historique des alertes</CardTitle>
          <CardDescription>{triggeredAlerts.length} alertes déclenchées</CardDescription>
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
                    <TableCell className="font-medium">{alert.symbol}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="opacity-70">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getAlertConditionLabel(alert.condition)} {getAlertValueLabel(alert)}
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
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
    </div>
  )
}
