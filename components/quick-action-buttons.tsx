"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LayoutDashboard, HardDrive, BarChart2, Settings, CloudOff, Download, Star, Bell } from "lucide-react"

export function QuickActionButtons() {
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/dashboard")}
      >
        <LayoutDashboard className="h-6 w-6 mb-2" />
        <span>Tableau de bord</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/storage/visualization")}
      >
        <BarChart2 className="h-6 w-6 mb-2" />
        <span>Visualisation</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/settings/offline")}
      >
        <CloudOff className="h-6 w-6 mb-2" />
        <span>Mode hors ligne</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/settings/prefetch")}
      >
        <Download className="h-6 w-6 mb-2" />
        <span>Préchargement</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/favorites")}
      >
        <Star className="h-6 w-6 mb-2" />
        <span>Favoris</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/alerts")}
      >
        <Bell className="h-6 w-6 mb-2" />
        <span>Alertes</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/storage")}
      >
        <HardDrive className="h-6 w-6 mb-2" />
        <span>Stockage</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col h-24 items-center justify-center"
        onClick={() => navigateTo("/settings")}
      >
        <Settings className="h-6 w-6 mb-2" />
        <span>Paramètres</span>
      </Button>
    </div>
  )
}
