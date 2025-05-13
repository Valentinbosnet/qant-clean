import AlphaVantageDiagnostic from "@/components/api/alpha-vantage-diagnostic"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AlphaVantagePage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diagnostic Alpha Vantage</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/debug/alpha-vantage/test">Tester l'API</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>

      <AlphaVantageDiagnostic />

      <div className="mt-8 bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">Informations sur l'API Alpha Vantage</h2>
        <p className="mb-2">
          Alpha Vantage fournit des données financières en temps réel et historiques via une API REST.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Plan gratuit: 25 requêtes par jour</li>
          <li>Plan Premium (30$/mois): 120 requêtes par minute, 5 requêtes par seconde</li>
          <li>Plan Premium Plus (50$/mois): 600 requêtes par minute, 10 requêtes par seconde</li>
        </ul>
        <p className="mt-2">
          Si vous rencontrez des problèmes avec votre clé API, contactez le support Alpha Vantage à{" "}
          <a href="mailto:support@alphavantage.co" className="text-blue-500 hover:underline">
            support@alphavantage.co
          </a>
        </p>
      </div>
    </div>
  )
}
