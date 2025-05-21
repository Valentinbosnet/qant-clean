"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserBehavior, predictNextRoutes } from "@/lib/prefetch-service"

export function NavigationPatternsVisualizer() {
  const [behavior, setBehavior] = useState(getUserBehavior())
  const [currentRoute, setCurrentRoute] = useState("")
  const [predictedRoutes, setPredictedRoutes] = useState<string[]>([])

  // Charger les données de comportement
  useEffect(() => {
    setBehavior(getUserBehavior())
  }, [])

  // Mettre à jour les prédictions lorsque la route actuelle change
  useEffect(() => {
    if (currentRoute) {
      setPredictedRoutes(predictNextRoutes(currentRoute))
    } else {
      setPredictedRoutes([])
    }
  }, [currentRoute])

  // Obtenir les routes les plus fréquentes
  const topRoutes = Object.entries(behavior.frequentRoutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Obtenir les modèles de navigation les plus fréquents
  const topPatterns = [...behavior.navigationPatterns].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Habitudes de navigation</CardTitle>
          <CardDescription>
            Visualisez vos habitudes de navigation pour comprendre le préchargement intelligent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Routes les plus fréquentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRoutes.length > 0 ? (
                topRoutes.map(([route, count], index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => setCurrentRoute(route)}
                  >
                    <span className="font-medium truncate">{route}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{count} visites</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Modèles de navigation fréquents</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">De</th>
                    <th className="text-left p-2">Vers</th>
                    <th className="text-left p-2">Fréquence</th>
                    <th className="text-left p-2">Dernière visite</th>
                  </tr>
                </thead>
                <tbody>
                  {topPatterns.length > 0 ? (
                    topPatterns.map((pattern, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentRoute(pattern.fromRoute)}
                      >
                        <td className="p-2 truncate max-w-[150px]">{pattern.fromRoute}</td>
                        <td className="p-2 truncate max-w-[150px]">{pattern.toRoute}</td>
                        <td className="p-2">{pattern.count}</td>
                        <td className="p-2 text-sm">{new Date(pattern.lastVisited).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500 italic">
                        Aucun modèle de navigation disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Simulateur de prédiction</h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="current-route" className="text-sm font-medium">
                  Route actuelle
                </label>
                <input
                  id="current-route"
                  type="text"
                  value={currentRoute}
                  onChange={(e) => setCurrentRoute(e.target.value)}
                  placeholder="Entrez une route (ex: /dashboard)"
                  className="border rounded p-2"
                />
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">Routes prédites</h4>
                {predictedRoutes.length > 0 ? (
                  <ul className="space-y-2">
                    {predictedRoutes.map((route, index) => (
                      <li key={index} className="bg-blue-50 p-2 rounded border border-blue-100 flex justify-between">
                        <span>{route}</span>
                        <span className="text-sm text-blue-600">Prédiction #{index + 1}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    {currentRoute
                      ? "Aucune prédiction disponible pour cette route"
                      : "Entrez une route pour voir les prédictions"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
