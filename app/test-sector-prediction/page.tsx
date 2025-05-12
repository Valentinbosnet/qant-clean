import { SectorAwarePrediction } from "@/components/sector-aware-prediction"

export default function TestSectorPredictionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Test des Prédictions IA+ par Secteur</h1>
      <p className="mb-6 text-muted-foreground">
        Cette page vous permet de tester les prédictions IA+ optimisées par secteur d'activité pour n'importe quel
        symbole boursier.
      </p>

      <div className="max-w-3xl mx-auto">
        <SectorAwarePrediction />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">À propos des prédictions sectorielles</h2>
        <p className="text-sm text-muted-foreground">
          Les prédictions sectorielles utilisent des prompts spécialisés par secteur d'activité pour générer des
          analyses plus précises et pertinentes. Chaque secteur (technologie, finance, santé, etc.) a ses propres
          facteurs clés et dynamiques qui sont pris en compte dans l'analyse.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Essayez différents symboles de différents secteurs pour voir comment les analyses varient en fonction du
          contexte sectoriel.
        </p>
      </div>
    </div>
  )
}
