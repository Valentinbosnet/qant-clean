import { SectorAwarePrediction } from "@/components/sector-aware-prediction"

export default function SectorPredictionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Prédictions IA+ par Secteur</h1>
      <p className="mb-6 text-muted-foreground">
        Obtenez des prédictions boursières optimisées par secteur d'activité pour une meilleure précision.
      </p>

      <div className="max-w-3xl mx-auto">
        <SectorAwarePrediction />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Pourquoi des prédictions par secteur ?</h2>
          <p className="text-sm text-muted-foreground">
            Chaque secteur économique est influencé par des facteurs spécifiques. Les actions technologiques réagissent
            différemment des actions énergétiques ou financières. Nos prédictions sectorielles prennent en compte ces
            spécificités pour des analyses plus pertinentes.
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Secteurs supportés</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Technologie</li>
            <li>• Finance</li>
            <li>• Santé</li>
            <li>• Consommation</li>
            <li>• Industrie</li>
            <li>• Énergie</li>
            <li>• Services publics</li>
            <li>• Matériaux</li>
            <li>• Communication</li>
            <li>• Immobilier</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
