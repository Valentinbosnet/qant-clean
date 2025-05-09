import { AdvancedApiDiagnostics } from "@/components/api/advanced-api-diagnostics"

export default function OpenAIAdvancedDebugPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Diagnostic avancé de l'API OpenAI</h1>
      <p className="text-muted-foreground mb-6">
        Utilisez cet outil pour diagnostiquer et résoudre les problèmes liés à la clé API OpenAI.
      </p>

      <AdvancedApiDiagnostics />
    </div>
  )
}
