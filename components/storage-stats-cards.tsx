import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StorageAnalysis, CacheStats } from "@/lib/offline-mode"
import { HardDrive, Database, Clock, BarChart3 } from "lucide-react"

interface StorageStatsCardsProps {
  analysis: StorageAnalysis
  stats: CacheStats
}

export function StorageStatsCards({ analysis, stats }: StorageStatsCardsProps) {
  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Formater la date
  const formatDate = (date: Date | null) => {
    if (!date) return "Jamais"
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <HardDrive className="h-8 w-8 text-primary" />
            <div className="space-y-2 w-full">
              <p className="text-sm font-medium text-muted-foreground">Espace utilisé</p>
              <div className="flex justify-between">
                <p className="text-2xl font-bold">{formatSize(analysis.totalSize)}</p>
                <p className="text-sm text-muted-foreground self-end">sur {formatSize(analysis.quota)}</p>
              </div>
              <Progress value={analysis.usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{analysis.usagePercentage.toFixed(1)}% utilisé</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Database className="h-8 w-8 text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Éléments en cache</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Taux de compression: {stats.compressionRatio.toFixed(2)}x</p>
                <p>Espace économisé: {formatSize(stats.totalSize - stats.compressedSize)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Clock className="h-8 w-8 text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
              <p className="text-xl font-bold">{formatDate(stats.newestItem)}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Premier élément: {formatDate(stats.oldestItem)}</p>
                <p>{stats.expiringItems} éléments expirent bientôt</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Types de données</p>
              <p className="text-2xl font-bold">{Object.keys(stats.itemsByType).length}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {Object.entries(stats.itemsByType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([type, count]) => (
                    <p key={type}>
                      {type}: {count} éléments
                    </p>
                  ))}
                {Object.keys(stats.itemsByType).length > 2 && (
                  <p>+ {Object.keys(stats.itemsByType).length - 2} autres types</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
