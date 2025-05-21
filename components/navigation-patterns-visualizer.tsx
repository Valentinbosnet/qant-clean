"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for navigation patterns
const defaultNavigationData = [
  { path: "/dashboard", visits: 120, avgTime: 240 },
  { path: "/market-predictions", visits: 80, avgTime: 180 },
  { path: "/favorites", visits: 60, avgTime: 120 },
  { path: "/alerts", visits: 40, avgTime: 90 },
  { path: "/settings", visits: 30, avgTime: 60 },
]

export function NavigationPatternsVisualizer() {
  const [navigationData, setNavigationData] = useState(defaultNavigationData)
  const [activeTab, setActiveTab] = useState("visits")

  // In a real app, this would fetch actual navigation data
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // This would be an API call in a real app
      setNavigationData(defaultNavigationData)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Navigation Patterns</CardTitle>
        <CardDescription>Analyze how users navigate through your application</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="visits">Page Visits</TabsTrigger>
            <TabsTrigger value="time">Time Spent</TabsTrigger>
            <TabsTrigger value="flow">User Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="visits" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={navigationData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#8884d8" name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="time" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={navigationData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#82ca9d" name="Avg. Time (seconds)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="flow" className="h-80">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  User flow visualization is not available in the demo version
                </p>
                <Button variant="outline">Upgrade to Pro</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
