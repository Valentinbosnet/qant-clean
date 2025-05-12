import { EnhancedSectorPrediction } from "@/components/enhanced-sector-prediction"

export default function TestEnhancedSectorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Prédictions avec Indicateurs Macroéconomiques Sectoriels</h1>
      <p className="text-lg mb-8">
        Cette page démontre l'intégration des indicateurs macroéconomiques spécifiques à chaque secteur dans nos
        prédictions boursières.
      </p>

      <EnhancedSectorPrediction />
    </div>
  )
}
