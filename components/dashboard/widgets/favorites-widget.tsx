"use client"

import { useEffect, useState } from "react"
import { useFavorites } from "@/hooks/use-favorites"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import type { WidgetConfig } from "@/lib/dashboard-service"

interface FavoritesWidgetProps {
  config: WidgetConfig
}

export function FavoritesWidget({ config }: FavoritesWidgetProps) {
  const { favorites, isLoading, error } = useFavorites()
  const [displayCount, setDisplayCount] = useState(config.settings?.displayCount || 5)

  useEffect(() => {
    if (config.settings?.displayCount) {
      setDisplayCount(config.settings.displayCount)
    }
  }, [config.settings])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">Erreur lors du chargement des favoris</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Aucun favori</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/favorites">Ajouter des favoris</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {favorites.slice(0, displayCount).map((favorite) => (
        <Card key={favorite.symbol} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{favorite.symbol}</p>
              <p className="text-sm text-muted-foreground">{favorite.name}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/stock/${favorite.symbol}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}

      {favorites.length > displayCount && (
        <Button variant="link" asChild className="w-full">
          <Link href="/favorites">Voir tous les favoris</Link>
        </Button>
      )}
    </div>
  )
}
