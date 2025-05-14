"use client"

import MigrateDashboardLayouts from "@/scripts/migrate-dashboard-layouts"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function MigrationPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Migration des Layouts de Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">
            Migrez vos anciennes préférences de tableau de bord vers le nouveau format
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <MigrateDashboardLayouts />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">À propos de la migration</h2>
        <p className="text-muted-foreground">
          Cette page vous permet de migrer vos préférences de tableau de bord depuis l'ancienne table
          <code className="mx-1 px-1 py-0.5 bg-muted rounded">dashboard_preferences</code>
          vers la nouvelle table
          <code className="mx-1 px-1 py-0.5 bg-muted rounded">dashboard_layouts</code>.
        </p>
        <p className="text-muted-foreground mt-2">
          La migration est nécessaire uniquement si vous avez utilisé l'application avant la mise à jour du système de
          tableau de bord. Si vous êtes un nouvel utilisateur, vous n'avez pas besoin d'exécuter cette migration.
        </p>
      </div>
    </div>
  )
}
