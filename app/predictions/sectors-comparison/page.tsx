"use client"

import { useState } from "react"
import { SectorSelector } from "@/components/sector-selector"
import { SectorComparisonChart } from "@/components/sector-comparison-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import type { SectorType } from "@/lib/sector-classification"
import type { SectorComparisonData } from "@/lib/sector-comparison-service"

export default function SectorsComparisonPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<SectorComparisonData[] | null>(null)

  const handleSelectSectors = async (sectors: SectorType[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sectors/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectors }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()
      setComparisonData(data)
    } catch (err) {
      console.error("Error comparing sectors:", err)
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors de la comparaison des secteurs")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comparaison des Secteurs</h1>
          <p className="text-muted-foreground">
            Analysez et comparez les perspectives de différents secteurs économiques pour optimiser votre allocation
            d'actifs et identifier les meilleures opportunités d'investissement.
          </p>
        </div>

        <div className="space-y-8">
          <SectorSelector onSelectSectors={handleSelectSectors} loading={loading} maxSelections={5} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          ) : comparisonData ? (
            <SectorComparisonChart data={comparisonData} />
          ) : (
            <div className="p-8 text-center bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Sélectionnez les secteurs à comparer et cliquez sur "Comparer les secteurs" pour voir l'analyse.
              </p>
            </div>
          )}

          {comparisonData && (
            <div className="p-6 bg-muted/50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Analyse comparative des secteurs</h2>
              <p className="mb-4">
                Cette analyse compare les perspectives de {comparisonData.length} secteurs économiques en tenant compte
                des indicateurs macroéconomiques spécifiques à chaque secteur, des prédictions pour les actions
                représentatives et des tendances sectorielles.
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">Points clés à retenir:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>Meilleur secteur:</strong> {comparisonData[0]?.sectorName || "N/A"} avec un score de{" "}
                    {comparisonData[0]?.overallScore || "N/A"}
                  </li>
                  <li>
                    <strong>Secteur le plus risqué:</strong>{" "}
                    {comparisonData.find((s) => s.riskLevel === "high")?.sectorName ||
                      comparisonData.find((s) => s.riskLevel === "medium")?.sectorName ||
                      "Aucun"}
                  </li>
                  <li>
                    <strong>Meilleur potentiel de croissance:</strong>{" "}
                    {comparisonData.find((s) => s.growthPotential === "high")?.sectorName ||
                      comparisonData.find((s) => s.growthPotential === "medium")?.sectorName ||
                      "Aucun"}
                  </li>
                  <li>
                    <strong>Perspectives macroéconomiques:</strong> Les secteurs{" "}
                    {comparisonData
                      .filter((s) => s.macroOutlook === "bullish")
                      .map((s) => s.sectorName)
                      .join(", ") || "aucun"}{" "}
                    présentent des perspectives macroéconomiques favorables.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
