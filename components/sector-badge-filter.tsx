"use client"

import { Badge } from "@/components/ui/badge"
import { type SectorType, getSectorName } from "@/lib/sector-classification"

interface SectorBadgeFilterProps {
  sectors: SectorType[]
  selectedSector: SectorType | "all"
  onChange: (sector: SectorType | "all") => void
}

export function SectorBadgeFilter({ sectors, selectedSector, onChange }: SectorBadgeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge
        variant={selectedSector === "all" ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onChange("all")}
      >
        Tous les secteurs
      </Badge>

      {sectors.map((sector) => (
        <Badge
          key={sector}
          variant={selectedSector === sector ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onChange(sector)}
        >
          {getSectorName(sector)}
        </Badge>
      ))}
    </div>
  )
}
