import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Cpu,
  Stethoscope,
  Landmark,
  ShoppingBag,
  Factory,
  Flame,
  Lightbulb,
  Mountain,
  Radio,
  Building,
} from "lucide-react"
import { type SectorType, getSectorName } from "@/lib/sector-classification"

interface SectorBadgeProps {
  sector: SectorType
  className?: string
}

export function SectorBadge({ sector, className = "" }: SectorBadgeProps) {
  // Obtenir l'icône appropriée pour le secteur
  const getSectorIcon = () => {
    switch (sector) {
      case "technology":
        return <Cpu className="h-3 w-3 mr-1" />
      case "healthcare":
        return <Stethoscope className="h-3 w-3 mr-1" />
      case "financial":
        return <Landmark className="h-3 w-3 mr-1" />
      case "consumer":
        return <ShoppingBag className="h-3 w-3 mr-1" />
      case "industrial":
        return <Factory className="h-3 w-3 mr-1" />
      case "energy":
        return <Flame className="h-3 w-3 mr-1" />
      case "utilities":
        return <Lightbulb className="h-3 w-3 mr-1" />
      case "materials":
        return <Mountain className="h-3 w-3 mr-1" />
      case "communication":
        return <Radio className="h-3 w-3 mr-1" />
      case "real_estate":
        return <Building className="h-3 w-3 mr-1" />
      default:
        return <Building2 className="h-3 w-3 mr-1" />
    }
  }

  // Obtenir la couleur appropriée pour le secteur
  const getSectorColor = () => {
    switch (sector) {
      case "technology":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "healthcare":
        return "bg-green-100 text-green-800 border-green-200"
      case "financial":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "consumer":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "industrial":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "energy":
        return "bg-red-100 text-red-800 border-red-200"
      case "utilities":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "materials":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "communication":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "real_estate":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Badge variant="outline" className={`flex items-center text-xs ${getSectorColor()} ${className}`}>
      {getSectorIcon()}
      {getSectorName(sector)}
    </Badge>
  )
}
