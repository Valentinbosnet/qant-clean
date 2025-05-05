import { Info } from "lucide-react"

export default function ApiInfo() {
  return (
    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-blue-300 font-medium mb-1">À propos des données boursières</h3>
          <p className="text-blue-200 text-sm">
            Cette application utilise l'API Alpha Vantage pour récupérer des données boursières en temps réel. Veuillez
            noter que la version gratuite de l'API a des limites de 5 requêtes par minute et 500 requêtes par jour.
          </p>
          <p className="text-blue-200 text-sm mt-2">
            Si vous rencontrez des erreurs ou des données manquantes, cela peut être dû à ces limitations. Les données
            sont mises en cache pendant 1 minute pour optimiser l'utilisation de l'API.
          </p>
        </div>
      </div>
    </div>
  )
}
