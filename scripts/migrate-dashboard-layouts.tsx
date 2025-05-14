"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { v4 as uuidv4 } from "uuid"

export default function MigrateDashboardLayouts() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [migrationStats, setMigrationStats] = useState<{
    total: number
    migrated: number
    skipped: number
    failed: number
  }>({
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
  })

  const runMigration = async () => {
    setIsLoading(true)
    setStatus("running")
    setProgress(0)
    setMessage("Démarrage de la migration...")

    try {
      const supabase = createClientComponentClient()

      // Vérifier si la table dashboard_preferences existe
      setMessage("Vérification de la table dashboard_preferences...")
      const { error: checkError } = await supabase.from("dashboard_preferences").select("count").limit(1)

      if (checkError && checkError.message.includes("does not exist")) {
        setStatus("error")
        setMessage("La table dashboard_preferences n'existe pas. Rien à migrer.")
        setIsLoading(false)
        return
      }

      // Récupérer toutes les préférences de tableau de bord
      setMessage("Récupération des préférences de tableau de bord...")
      const { data: preferences, error: prefError } = await supabase.from("dashboard_preferences").select("*")

      if (prefError) {
        throw new Error(`Erreur lors de la récupération des préférences: ${prefError.message}`)
      }

      if (!preferences || preferences.length === 0) {
        setStatus("success")
        setMessage("Aucune préférence de tableau de bord à migrer.")
        setIsLoading(false)
        return
      }

      setMigrationStats({
        total: preferences.length,
        migrated: 0,
        skipped: 0,
        failed: 0,
      })

      // Migrer chaque préférence
      for (let i = 0; i < preferences.length; i++) {
        const pref = preferences[i]
        setProgress(Math.round(((i + 1) / preferences.length) * 100))
        setMessage(`Migration des préférences pour l'utilisateur ${pref.user_id} (${i + 1}/${preferences.length})...`)

        try {
          // Vérifier si un layout existe déjà pour cet utilisateur
          const { data: existingLayout } = await supabase
            .from("dashboard_layouts")
            .select("id")
            .eq("user_id", pref.user_id)
            .single()

          if (existingLayout) {
            // Si un layout existe déjà, passer à l'utilisateur suivant
            setMigrationStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }))
            continue
          }

          // Convertir le format des préférences au format de layout
          const layout = {
            id: uuidv4(),
            user_id: pref.user_id,
            name: "Migré depuis dashboard_preferences",
            layout: typeof pref.layout === "string" ? JSON.parse(pref.layout) : pref.layout,
            is_default: true,
            created_at: pref.created_at || new Date().toISOString(),
            last_updated: pref.updated_at || new Date().toISOString(),
          }

          // Insérer le nouveau layout
          const { error: insertError } = await supabase.from("dashboard_layouts").insert(layout)

          if (insertError) {
            throw new Error(`Erreur lors de l'insertion du layout: ${insertError.message}`)
          }

          setMigrationStats((prev) => ({ ...prev, migrated: prev.migrated + 1 }))
        } catch (error) {
          console.error(`Erreur lors de la migration pour l'utilisateur ${pref.user_id}:`, error)
          setMigrationStats((prev) => ({ ...prev, failed: prev.failed + 1 }))
        }
      }

      setStatus("success")
      setMessage(
        `Migration terminée. ${migrationStats.migrated} layouts migrés, ${migrationStats.skipped} ignorés, ${migrationStats.failed} échoués.`,
      )
    } catch (error) {
      console.error("Erreur lors de la migration:", error)
      setStatus("error")
      setMessage(`Erreur lors de la migration: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Migration des Layouts de Tableau de Bord</CardTitle>
        <CardDescription>
          Cet outil migre les données de la table dashboard_preferences vers la nouvelle table dashboard_layouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "running" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Migration réussie</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
              {migrationStats.total > 0 && (
                <div className="mt-2 space-y-1">
                  <p>Total: {migrationStats.total}</p>
                  <p>Migrés: {migrationStats.migrated}</p>
                  <p>Ignorés: {migrationStats.skipped}</p>
                  <p>Échoués: {migrationStats.failed}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runMigration} disabled={isLoading}>
          {isLoading ? "Migration en cours..." : "Démarrer la migration"}
        </Button>
      </CardFooter>
    </Card>
  )
}
