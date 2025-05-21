"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  StarIcon,
  BellIcon,
  SettingsIcon,
  HomeIcon,
  CloudOffIcon,
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Accueil",
      href: "/start",
      icon: <HomeIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: <LayoutDashboardIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Prédictions",
      href: "/market-predictions",
      icon: <TrendingUpIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Favoris",
      href: "/favorites",
      icon: <StarIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Alertes",
      href: "/alerts",
      icon: <BellIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Mode hors ligne",
      href: "/settings/offline",
      icon: <CloudOffIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Paramètres",
      href: "/settings",
      icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid gap-1">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn("justify-start", pathname === item.href && "bg-muted font-medium")}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
