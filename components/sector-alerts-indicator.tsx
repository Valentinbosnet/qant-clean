"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { sectorAlertsService } from "@/lib/sector-alerts-service"
import Link from "next/link"

interface SectorAlertsIndicatorProps {
  userId?: string
  variant?: "icon" | "button"
}

export function SectorAlertsIndicator({ userId, variant = "icon" }: SectorAlertsIndicatorProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()

    // Vérifier les mises à jour toutes les 5 minutes
    const intervalId = setInterval(checkForUpdates, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [userId])

  const loadUnreadCount = async () => {
    try {
      const unreadAlerts = await sectorAlertsService.getUnreadAlerts(userId)
      setUnreadCount(unreadAlerts.length)
    } catch (error) {
      console.error("Error loading unread alerts count:", error)
    }
  }

  const checkForUpdates = async () => {
    try {
      const newAlerts = await sectorAlertsService.checkSectorIndicators(userId)
      if (newAlerts.length > 0) {
        await loadUnreadCount()
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
    }
  }

  if (variant === "button") {
    return (
      <Button variant="outline" size="sm" asChild className="relative">
        <Link href="/alerts/sectors">
          <Bell className="h-4 w-4 mr-2" />
          Alertes sectorielles
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
      </Button>
    )
  }

  return (
    <Link href="/alerts/sectors" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Link>
  )
}
