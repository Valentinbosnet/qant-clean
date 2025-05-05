"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

interface RealTimeAnalysisProps {
  symbol: string
}

export default function RealTimeAnalysis({ symbol }: RealTimeAnalysisProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/real-time-predictions?symbol=${symbol}&allowSimulated=true`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Error fetching real-time analysis:", err)
        setError("Failed to load analysis. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col justify-center items-center h-40 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Analysis: {symbol}</CardTitle>
        <CardDescription>Latest market prediction and technical indicators</CardDescription>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</p>
                <p className="text-2xl font-bold">${data.currentPrice?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prediction</p>
                <p className="text-2xl font-bold">{data.prediction || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Confidence</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${data.confidence || 0}%` }}></div>
              </div>
              <p className="text-right text-sm mt-1">{data.confidence?.toFixed(1) || 0}%</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Technical</p>
                <p className="font-medium">{data.signals?.technical || "N/A"}</p>
              </div>
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fundamental</p>
                <p className="font-medium">{data.signals?.fundamental || "N/A"}</p>
              </div>
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sentiment</p>
                <p className="font-medium">{data.signals?.sentiment || "N/A"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
