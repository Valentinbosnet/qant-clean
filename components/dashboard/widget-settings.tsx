"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { DashboardSettings } from "@/lib/dashboard-service"
import { useForm } from "react-hook-form"

interface WidgetSettingsProps {
  open: boolean
  onClose: () => void
  settings: DashboardSettings
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void
}

export function WidgetSettings({ open, onClose, settings, onUpdateSettings }: WidgetSettingsProps) {
  const form = useForm<DashboardSettings>({
    defaultValues: settings,
  })

  const onSubmit = (data: DashboardSettings) => {
    onUpdateSettings(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres du tableau de bord</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="columns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de colonnes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 12)}
                      min={6}
                      max={24}
                    />
                  </FormControl>
                  <FormDescription>Le nombre de colonnes dans votre grille (entre 6 et 24)</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rowHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hauteur des lignes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 30)}
                      min={10}
                      max={100}
                    />
                  </FormControl>
                  <FormDescription>La hauteur de chaque ligne en pixels</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compactType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de compactage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "null"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de compactage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="null">Aucun</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Comment les widgets doivent être compactés</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preventCollision"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Prévenir les collisions</FormLabel>
                    <FormDescription>Empêche les widgets de se chevaucher</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
