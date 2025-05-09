import { GenericPrediction } from "@/components/generic-prediction"

export default function AdvancedPredictionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Prédictions IA avancées</h1>
      <p className="text-muted-foreground mb-8">
        Utilisez l'IA pour générer des prédictions sur n'importe quel sujet ou scénario.
      </p>

      <GenericPrediction />
    </div>
  )
}
