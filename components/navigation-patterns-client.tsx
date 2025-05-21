"use client"

import { useState } from "react"

export default function NavigationPatternsClient() {
  const [activeTab, setActiveTab] = useState("routes")
  const [selectedRoute, setSelectedRoute] = useState("")

  // Mock data - this ensures we always have defined values
  const frequentRoutes = [
    { route: "/dashboard", count: 120 },
    { route: "/market-predictions", count: 80 },
    { route: "/favorites", count: 60 },
    { route: "/alerts", count: 40 },
    { route: "/settings", count: 30 },
  ]

  const patterns = [
    { from: "/dashboard", to: "/market-predictions", count: 45, lastVisited: "2023-05-20T10:30:00Z" },
    { from: "/market-predictions", to: "/favorites", count: 32, lastVisited: "2023-05-20T11:15:00Z" },
    { from: "/dashboard", to: "/alerts", count: 28, lastVisited: "2023-05-20T09:45:00Z" },
    { from: "/favorites", to: "/settings", count: 15, lastVisited: "2023-05-20T14:20:00Z" },
  ]

  // Hardcoded predictions for selected routes
  const routePredictions = {
    "/dashboard": ["/market-predictions", "/alerts", "/favorites"],
    "/market-predictions": ["/favorites", "/dashboard", "/alerts"],
    "/favorites": ["/market-predictions", "/settings", "/dashboard"],
  }

  // Get predictions for the selected route
  const predictions = selectedRoute ? routePredictions[selectedRoute as keyof typeof routePredictions] || [] : []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Patterns</h1>
      <div className="w-full bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Navigation Patterns</h2>
          <p className="text-gray-600 mb-6">Analyze how users navigate through your application</p>

          <div className="mb-6">
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 ${activeTab === "routes" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                onClick={() => setActiveTab("routes")}
              >
                Frequent Routes
              </button>
              <button
                className={`px-4 py-2 ${activeTab === "patterns" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                onClick={() => setActiveTab("patterns")}
              >
                Navigation Patterns
              </button>
              <button
                className={`px-4 py-2 ${activeTab === "predictions" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                onClick={() => setActiveTab("predictions")}
              >
                Route Predictions
              </button>
            </div>

            {activeTab === "routes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frequentRoutes.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedRoute(item.route)}
                  >
                    <span className="font-medium truncate">{item.route}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{item.count} visits</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "patterns" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">From</th>
                      <th className="text-left p-2">To</th>
                      <th className="text-left p-2">Count</th>
                      <th className="text-left p-2">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.map((pattern, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-2">{pattern.from}</td>
                        <td className="p-2">{pattern.to}</td>
                        <td className="p-2">{pattern.count}</td>
                        <td className="p-2">{new Date(pattern.lastVisited).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "predictions" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2">Select a route to see predictions</h3>
                  <div className="flex flex-wrap gap-2">
                    {frequentRoutes.map((item, index) => (
                      <button
                        key={index}
                        className={`px-3 py-1 rounded ${selectedRoute === item.route ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setSelectedRoute(item.route)}
                      >
                        {item.route}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRoute ? (
                  <div className="p-4 border rounded">
                    <h3 className="font-medium mb-2">Predictions for {selectedRoute}</h3>
                    {predictions.length > 0 ? (
                      <div className="space-y-2">
                        {predictions.map((route, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded border border-blue-100">
                            {route} <span className="text-xs text-blue-600 ml-2">Prediction #{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No predictions available for this route</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <h3 className="font-medium">Select a route</h3>
                        <p className="text-sm">Select a route above to see predicted next routes.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
