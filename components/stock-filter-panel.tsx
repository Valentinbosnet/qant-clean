"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import type { SectorType } from "@/lib/sector-classification"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SortOption =
  | "performance_asc"
  | "performance_desc"
  | "volatility_asc"
  | "volatility_desc"
  | "alphabetical_asc"
  | "alphabetical_desc"
  | "price_asc"
  | "price_desc"

export interface FilterCriteria {
  sector: SectorType | "all"
  trend: "up" | "down" | "all"
  minChangePercent: number
  maxChangePercent: number
  onlyFavorites: boolean
  sortBy: SortOption
}

interface StockFilterPanelProps {
  criteria: FilterCriteria
  onChange: (criteria: FilterCriteria) => void
}

export function StockFilterPanel({ criteria, onChange }: StockFilterPanelProps) {
  const defaultCriteria: FilterCriteria = {
    sector: "all",
    trend: "all",
    minChangePercent: 0,
    maxChangePercent: 100,
    onlyFavorites: false,
    sortBy: "performance_desc",
  }

  const resetFilters = () => {
    onChange(defaultCriteria)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrer et trier les prédictions</CardTitle>
        <CardDescription>Affinez les résultats selon vos critères</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="filter" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="filter">Filtres</TabsTrigger>
            <TabsTrigger value="sort">Tri</TabsTrigger>
          </TabsList>

          <TabsContent value="filter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Secteur</label>
                <Select
                  value={criteria.sector}
                  onValueChange={(value) => onChange({ ...criteria, sector: value as SectorType | "all" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les secteurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les secteurs</SelectItem>
                    <SelectItem value="technology">Technologie</SelectItem>
                    <SelectItem value="healthcare">Santé</SelectItem>
                    <SelectItem value="financial">Finance</SelectItem>
                    <SelectItem value="consumer">Consommation</SelectItem>
                    <SelectItem value="industrial">Industrie</SelectItem>
                    <SelectItem value="energy">Énergie</SelectItem>
                    <SelectItem value="utilities">Services publics</SelectItem>
                    <SelectItem value="materials">Matériaux</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="real_estate">Immobilier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tendance prédite</label>
                <Select
                  value={criteria.trend}
                  onValueChange={(value) => onChange({ ...criteria, trend: value as "up" | "down" | "all" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les tendances" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les tendances</SelectItem>
                    <SelectItem value="up">
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-2 text-green-500" />
                        Haussière
                      </div>
                    </SelectItem>
                    <SelectItem value="down">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-2 text-red-500" />
                        Baissière
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Variation prédite (%)</label>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 100]}
                    min={0}
                    max={100}
                    step={1}
                    value={[criteria.minChangePercent, criteria.maxChangePercent]}
                    onValueChange={(value) =>
                      onChange({
                        ...criteria,
                        minChangePercent: value[0],
                        maxChangePercent: value[1],
                      })
                    }
                    className="my-6"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{criteria.minChangePercent}%</span>
                    <span>{criteria.maxChangePercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="favorites-filter"
                checked={criteria.onlyFavorites}
                onCheckedChange={(checked) => onChange({ ...criteria, onlyFavorites: checked })}
              />
              <Label htmlFor="favorites-filter">Afficher uniquement mes favoris</Label>
            </div>
          </TabsContent>

          <TabsContent value="sort">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trier par</label>
                <Select
                  value={criteria.sortBy}
                  onValueChange={(value) => onChange({ ...criteria, sortBy: value as SortOption })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un critère de tri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance_desc">
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-2 text-green-500" />
                        Performance prédite (élevée à faible)
                      </div>
                    </SelectItem>
                    <SelectItem value="performance_asc">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-2 text-red-500" />
                        Performance prédite (faible à élevée)
                      </div>
                    </SelectItem>
                    <SelectItem value="volatility_desc">
                      <div className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Volatilité (élevée à faible)
                      </div>
                    </SelectItem>
                    <SelectItem value="volatility_asc">
                      <div className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Volatilité (faible à élevée)
                      </div>
                    </SelectItem>
                    <SelectItem value="alphabetical_asc">Alphabétique (A-Z)</SelectItem>
                    <SelectItem value="alphabetical_desc">Alphabétique (Z-A)</SelectItem>
                    <SelectItem value="price_asc">Prix (croissant)</SelectItem>
                    <SelectItem value="price_desc">Prix (décroissant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">À propos des critères de tri</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Performance prédite</strong> - Trie les actions selon le pourcentage de variation prédit
                    pour la période sélectionnée
                  </li>
                  <li>
                    <strong>Volatilité</strong> - Trie les actions selon leur volatilité historique (écart-type des
                    rendements)
                  </li>
                  <li>
                    <strong>Alphabétique</strong> - Trie les actions par symbole boursier
                  </li>
                  <li>
                    <strong>Prix</strong> - Trie les actions selon leur prix actuel
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Tri actuel: {getSortDescription(criteria.sortBy)}</div>

          <Button variant="outline" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getSortDescription(sortOption: SortOption): string {
  switch (sortOption) {
    case "performance_desc":
      return "Performance prédite (élevée à faible)"
    case "performance_asc":
      return "Performance prédite (faible à élevée)"
    case "volatility_desc":
      return "Volatilité (élevée à faible)"
    case "volatility_asc":
      return "Volatilité (faible à élevée)"
    case "alphabetical_asc":
      return "Alphabétique (A-Z)"
    case "alphabetical_desc":
      return "Alphabétique (Z-A)"
    case "price_asc":
      return "Prix (croissant)"
    case "price_desc":
      return "Prix (décroissant)"
    default:
      return "Performance prédite"
  }
}
