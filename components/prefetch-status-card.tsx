import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface PrefetchStatusCardProps {
  status: "active" | "limited" | "inactive"
  itemCount: number
  successRate: number
  lastUpdated: Date | null
}

export function PrefetchStatusCard({ status, itemCount, successRate, lastUpdated }: PrefetchStatusCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600"
      case "limited":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "inactive":
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Actif"
      case "limited":
        return "Limité"
      case "inactive":
        return "Inactif"
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Statut du préchargement</CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>{getStatusText()}</Badge>
        </div>
        <CardDescription>Statistiques du système de préchargement intelligent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Éléments préchargés</p>
            <p className="text-2xl font-bold">{itemCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taux de succès</p>
            <p className="text-2xl font-bold">{successRate}%</p>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-4">
            Dernière mise à jour: {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
