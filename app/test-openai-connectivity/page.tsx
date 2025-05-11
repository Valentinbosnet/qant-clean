import type { Metadata } from "next"
import { OpenAIConnectivityTest } from "@/components/api/openai-connectivity-test"

export const metadata: Metadata = {
  title: "Test de connectivité OpenAI",
  description: "Vérifiez que votre clé API OpenAI est correctement configurée et fonctionne",
}

export default function TestOpenAIConnectivityPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Test de connectivité OpenAI</h1>

      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          Cette page vous permet de vérifier si votre clé API OpenAI est correctement configurée et fonctionne. Le test
          effectue un appel simple à l'API OpenAI pour confirmer que la connexion est établie.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <h2 className="text-amber-800 font-medium mb-2">Informations importantes</h2>
          <ul className="list-disc list-inside text-amber-700 space-y-1">
            <li>
              Assurez-vous que la variable d'environnement{" "}
              <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> est définie
            </li>
            <li>
              La clé API doit commencer par <code className="bg-amber-100 px-1 rounded">sk-</code> et avoir une longueur
              suffisante
            </li>
            <li>Vérifiez que votre compte OpenAI dispose de crédits suffisants</li>
          </ul>
        </div>
      </div>

      <OpenAIConnectivityTest />
    </div>
  )
}
