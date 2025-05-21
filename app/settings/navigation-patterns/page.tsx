"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function NavigationPatternsPage() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("routes")
  const [selectedRoute, setSelectedRoute] = useState("")

  // This ensures we only render the component on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // If we're not on the client yet, render a simple loading state
  if (!isClient) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Navigation Patterns</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load your navigation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-center">
                <div className="h-8 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2 mx-auto"></div>
                <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Patterns</h1>
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
    </div>
  )
}
