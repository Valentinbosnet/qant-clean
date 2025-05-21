"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

// Mock data for navigation patterns
const mockNavigationData = {
  frequentRoutes: [
    { route: "/dashboard", count: 120 },
    { route: "/market-predictions", count: 80 },
    { route: "/favorites", count: 60 },
    { route: "/alerts", count: 40 },
    { route: "/settings", count: 30 },
  ],
  patterns: [
    { from: "/dashboard", to: "/market-predictions", count: 45, lastVisited: "2023-05-20T10:30:00Z" },
    { from: "/market-predictions", to: "/favorites", count: 32, lastVisited: "2023-05-20T11:15:00Z" },
    { from: "/dashboard", to: "/alerts", count: 28, lastVisited: "2023-05-20T09:45:00Z" },
    { from: "/favorites", to: "/settings", count: 15, lastVisited: "2023-05-20T14:20:00Z" },
  ],
  predictions: [
    { currentRoute: "/dashboard", predictedRoutes: ["/market-predictions", "/alerts", "/favorites"] },
    { currentRoute: "/market-predictions", predictedRoutes: ["/favorites", "/dashboard", "/alerts"] },
    { currentRoute: "/favorites", predictedRoutes: ["/market-predictions", "/settings", "/dashboard"] },
  ],
}

export function NavigationPatternsVisualizer() {
  const [activeTab, setActiveTab] = useState("routes")
  const [selectedRoute, setSelectedRoute] = useState("")

  // Safe access to mock data with fallbacks
  const frequentRoutes = mockNavigationData?.frequentRoutes || []
  const patterns = mockNavigationData?.patterns || []
  const predictions = mockNavigationData?.predictions || []

  // Find predictions for selected route
  const routePredictions = predictions.find((p) => p.currentRoute === selectedRoute)?.predictedRoutes || []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Navigation Patterns</CardTitle>
        <CardDescription>Analyze how users navigate through your application</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="routes">Frequent Routes</TabsTrigger>
            <TabsTrigger value="patterns">Navigation Patterns</TabsTrigger>
            <TabsTrigger value="predictions">Route Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="routes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequentRoutes.length > 0 ? (
                frequentRoutes.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedRoute(item.route)}
                  >
                    <span className="font-medium truncate">{item.route}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{item.count} visits</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No data available</AlertTitle>
                    <AlertDescription>Start browsing the application to collect navigation data.</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patterns">
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
                  {patterns.length > 0 ? (
                    patterns.map((pattern, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-2">{pattern.from}</td>
                        <td className="p-2">{pattern.to}</td>
                        <td className="p-2">{pattern.count}</td>
                        <td className="p-2">{new Date(pattern.lastVisited).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No navigation patterns recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Select a route to see predictions</h3>
                <div className="flex flex-wrap gap-2">
                  {frequentRoutes.map((item, index) => (
                    <Button
                      key={index}
                      variant={selectedRoute === item.route ? "default" : "outline"}
                      onClick={() => setSelectedRoute(item.route)}
                    >
                      {item.route}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedRoute ? (
                <div className="p-4 border rounded">
                  <h3 className="font-medium mb-2">Predictions for {selectedRoute}</h3>
                  {routePredictions.length > 0 ? (
                    <div className="space-y-2">
                      {routePredictions.map((route, index) => (
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
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Select a route</AlertTitle>
                  <AlertDescription>Select a route above to see predicted next routes.</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
