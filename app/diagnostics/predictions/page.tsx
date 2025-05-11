import { PredictionDiagnostics } from "@/components/prediction-diagnostics"

export default function PredictionDiagnosticsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Diagnostic des Prédictions</h1>
      <p className="text-muted-foreground mb-6">
        Vérifiez que les prédictions IA+ fonctionnent correctement sans nécessiter de clé API OpenAI.
      </p>

      <div className="grid gap-6">
        <PredictionDiagnostics />
      </div>
    </div>
  )
}
