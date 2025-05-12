"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getAllSectors } from "@/lib/sector-comparison-service"
import { Building2, RefreshCw } from "lucide-react"
import type { SectorType } from "@/lib/sector-classification"

interface SectorSelectorProps {
  onSelectSectors: (sectors: SectorType[]) => void
  loading?: boolean
  maxSelections?: number
}

export function SectorSelector({ onSelectSectors, loading = false, maxSelections = 5 }: SectorSelectorProps) {
  const [selectedSectors, setSelectedSectors] = useState<SectorType[]>(["technology", "financial", "healthcare"])
  const allSectors = getAllSectors()

  const handleSectorChange = (sector: SectorType, checked: boolean) => {
    if (checked) {
      // Si on atteint le maximum de sélections, ne rien faire
      if (selectedSectors.length >= maxSelections) return

      setSelectedSectors([...selectedSectors, sector])
    } else {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector))
    }
  }

  const handleSubmit = () => {
    if (selectedSectors.length > 0) {
      onSelectSectors(selectedSectors)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Sélection des Secteurs
        </CardTitle>
        <CardDescription>
          Choisissez jusqu'à {maxSelections} secteurs à comparer (actuellement {selectedSectors.length} sélectionné
          {selectedSectors.length > 1 ? "s" : ""})
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allSectors.map((sector) => (
            <div key={sector.type} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${sector.type}`}
                checked={selectedSectors.includes(sector.type)}
                onCheckedChange={(checked) => handleSectorChange(sector.type, checked === true)}
                disabled={
                  loading || (selectedSectors.length >= maxSelections && !selectedSectors.includes(sector.type))
                }
              />
              <Label
                htmlFor={`sector-${sector.type}`}
                className={`${
                  selectedSectors.length >= maxSelections && !selectedSectors.includes(sector.type)
                    ? "text-muted-foreground"
                    : ""
                }`}
              >
                {sector.name}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSubmit} disabled={selectedSectors.length === 0 || loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            "Comparer les secteurs"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
