"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function NavigationPatternsVisualizer() {
  const [patterns, setPatterns] = useState([
    { path: "/dashboard", visits: 42, lastVisit: new Date().toISOString() },
    { path: "/stocks/AAPL", visits: 23, lastVisit: new Date().toISOString() },
    { path: "/predictions", visits: 18, lastVisit: new Date().toISOString() },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Patterns</CardTitle>
        <CardDescription>Visualize your app navigation patterns to optimize prefetching</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{pattern.path}</p>
                <p className="text-sm text-muted-foreground">{pattern.visits} visits</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Last visit</p>
                <p className="text-xs text-muted-foreground">{new Date(pattern.lastVisit).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Reset Analytics</Button>
      </CardFooter>
    </Card>
  )
}

export default NavigationPatternsVisualizer
