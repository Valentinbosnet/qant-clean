"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { WidgetConfig } from "@/lib/dashboard-service"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface WidgetSettingsFormProps {
  widget: WidgetConfig
  onSubmit: (settings: any) => void
}

// Configuration des champs de paramètres pour chaque type de widget
const widgetSettingsFields: Record<string, { field: string; label: string; type: string; options?: any[] }[]> = {
  prediction: [
    { field: "symbol", label: "Symbole de l'action", type: "text" },
    { field: "days", label: "Nombre de jours", type: "number" },
    {
      field: "algorithm",
      label: "Algorithme",
      type: "select",
      options: [
        { value: "ensemble", label: "Ensemble" },
        { value: "ai", label: "Intelligence Artificielle" },
        { value: "linear", label: "Régression Linéaire" },
        { value: "sma", label: "Moyenne Mobile Simple" },
      ],
    },
  ],
  favorites: [
    { field: "limit", label: "Nombre d'actions à afficher", type: "number" },
    { field: "showCharts", label: "Afficher les graphiques", type: "boolean" },
  ],
  market: [
    { field: "showChart", label: "Afficher le graphique", type: "boolean" },
    {
      field: "index",
      label: "Indice principal",
      type: "select",
      options: [
        { value: "GSPC", label: "S&P 500" },
        { value: "DJI", label: "Dow Jones" },
        { value: "IXIC", label: "NASDAQ" },
        { value: "N100", label: "EURONEXT 100" },
      ],
    },
  ],
  stock: [
    { field: "symbol", label: "Symbole de l'action", type: "text" },
    { field: "showDetails", label: "Afficher les détails", type: "boolean" },
    { field: "showChart", label: "Afficher le graphique", type: "boolean" },
  ],
  news: [
    { field: "count", label: "Nombre d'articles", type: "number" },
    {
      field: "category",
      label: "Catégorie",
      type: "select",
      options: [
        { value: "business", label: "Business" },
        { value: "market", label: "Marchés" },
        { value: "economy", label: "Économie" },
        { value: "technology", label: "Technologie" },
      ],
    },
  ],
  sector: [
    {
      field: "sector",
      label: "Secteur",
      type: "select",
      options: [
        { value: "technology", label: "Technologie" },
        { value: "financial", label: "Finance" },
        { value: "healthcare", label: "Santé" },
        { value: "consumer", label: "Consommation" },
        { value: "energy", label: "Énergie" },
      ],
    },
  ],
  performance: [
    {
      field: "period",
      label: "Période",
      type: "select",
      options: [
        { value: "week", label: "Semaine" },
        { value: "month", label: "Mois" },
        { value: "quarter", label: "Trimestre" },
        { value: "year", label: "Année" },
      ],
    },
    { field: "compareIndex", label: "Comparer à l'indice", type: "boolean" },
  ],
}

export function WidgetSettingsForm({ widget, onSubmit }: WidgetSettingsFormProps) {
  const [title, setTitle] = useState(widget.title)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Définir les champs de paramètres pour ce type de widget
  const settingsFields = widgetSettingsFields[widget.type] || []

  // Configuration du formulaire
  const form = useForm({
    defaultValues: {
      ...widget.settings,
    },
  })

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Mettre à jour les paramètres et le titre
      onSubmit({
        title,
        settings: data,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="widget-title" className="text-sm font-medium">
          Titre du widget
        </label>
        <Input
          id="widget-title"
          placeholder="Titre du widget"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {settingsFields.map((field) => (
            <FormField
              key={field.field}
              control={form.control}
              name={field.field as any}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === "text" && <Input {...formField} />}
                    {field.type === "number" && (
                      <Input
                        type="number"
                        {...formField}
                        value={formField.value}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                      />
                    )}
                    {field.type === "select" && (
                      <Select onValueChange={formField.onChange} value={formField.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "boolean" && (
                      <div className="pt-2">
                        <Switch checked={formField.value} onCheckedChange={formField.onChange} />
                      </div>
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
