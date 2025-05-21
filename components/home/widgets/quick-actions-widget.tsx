import { Button } from "@/components/ui/button"
import { Search, Star, BarChart2, Bell, Settings } from "lucide-react"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface QuickActionsWidgetProps {
  config: HomeWidgetConfig
}

export function QuickActionsWidget({ config }: QuickActionsWidgetProps) {
  const actions = [
    { icon: <Search className="h-4 w-4" />, label: "Rechercher", href: "/search" },
    { icon: <Star className="h-4 w-4" />, label: "Favoris", href: "/favorites" },
    { icon: <BarChart2 className="h-4 w-4" />, label: "Prédictions", href: "/predictions" },
    { icon: <Bell className="h-4 w-4" />, label: "Alertes", href: "/alerts" },
    { icon: <Settings className="h-4 w-4" />, label: "Paramètres", href: "/settings" },
  ]

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-1 sm:gap-2 sm:grid-cols-3 md:grid-cols-5">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col h-auto py-2 sm:py-3 text-xs sm:text-sm"
            asChild
          >
            <a href={action.href}>
              <span className="mb-1">{action.icon}</span>
              <span className="text-xs">{action.label}</span>
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}
