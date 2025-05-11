import type React from "react"
import type { Metadata } from "next"
import { OpenAIKeyStatus } from "@/components/api/openai-key-status"

export const metadata: Metadata = {
  title: "Test de connectivité OpenAI",
  description: "Vérifiez que votre clé API OpenAI est correctement configurée et fonctionne",
}

export default function TestOpenAIConnectivityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container max-w-4xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">{children}</div>
        <div className="md:col-span-1">
          <div className="space-y-6">
            <OpenAIKeyStatus />

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-medium mb-2 text-sm">Liens utiles</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="/settings/api" className="text-blue-600 hover:underline">
                    Configuration de l'API
                  </a>
                </li>
                <li>
                  <a href="/test-ia-plus" className="text-blue-600 hover:underline">
                    Test IA+
                  </a>
                </li>
                <li>
                  <a href="/debug/openai" className="text-blue-600 hover:underline">
                    Diagnostic avancé
                  </a>
                </li>
                <li>
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Gérer les clés API (OpenAI)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
