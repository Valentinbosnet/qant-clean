"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function CompressionSettingsClient() {
  const [compressionEnabled, setCompressionEnabled] = useState(false)
  const [threshold, setThreshold] = useState(1024)
  const [quota, setQuota] = useState(50 * 1024 * 1024)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionResult, setCompressionResult] = useState<{ processed: number; saved: number } | null>(null)

  // Format size in KB or MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Mock stats
  const mockStats = {
    totalItems: 42,
    compressionRatio: 1.8,
    totalSize: 5.2 * 1024 * 1024,
    compressedSize: 2.9 * 1024 * 1024,
    usagePercentage: 28,
    itemsByType: {
      json: 24,
      text: 12,
      binary: 6,
    },
  }

  // Mock analysis
  const mockAnalysis = {
    suggestions: [
      "Your compression threshold is high. Consider lowering it to compress more data.",
      "You have several large items in your cache. Review them to ensure they're necessary.",
    ],
    largestItems: [
      { key: "offline_stock_data_AAPL", size: 245000, type: "json" },
      { key: "offline_user_preferences", size: 128000, type: "json" },
      { key: "offline_dashboard_layout", size: 98000, type: "json" },
    ],
  }

  // Simulate compression
  const compressAll = () => {
    setIsCompressing(true)
    setTimeout(() => {
      setCompressionResult({
        processed: 18,
        saved: 1.2 * 1024 * 1024,
      })
      setIsCompressing(false)
    }, 1500)
  }

  // Simulate cleanup
  const cleanupCache = () => {
    alert("Cache cleanup complete. 12 items removed.")
  }

  // Simulate save settings
  const saveSettings = () => {
    alert("Settings saved successfully.")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Compression Settings</h1>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Offline Data Compression</CardTitle>
          <CardDescription>Optimize storage usage for offline mode</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Data Compression</h3>
                    <p className="text-sm text-muted-foreground">Reduce the size of locally stored data</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{compressionEnabled ? "On" : "Off"}</span>
                    <button
                      className={`w-10 h-5 rounded-full transition-colors ${
                        compressionEnabled ? "bg-primary" : "bg-gray-300"
                      }`}
                      onClick={() => setCompressionEnabled(!compressionEnabled)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          compressionEnabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Compression Threshold ({formatSize(threshold)})</label>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="10240"
                    step="512"
                    value={threshold}
                    onChange={(e) => setThreshold(Number.parseInt(e.target.value))}
                    disabled={!compressionEnabled}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Data smaller than this threshold will not be compressed
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Storage Quota ({formatSize(quota)})</label>
                  </div>
                  <input
                    type="range"
                    min={1 * 1024 * 1024}
                    max={100 * 1024 * 1024}
                    step={1 * 1024 * 1024}
                    value={quota}
                    onChange={(e) => setQuota(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Maximum limit for local storage usage</p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={compressAll}
                    disabled={isCompressing || !compressionEnabled}
                    variant="outline"
                    className="w-full"
                  >
                    {isCompressing ? "Compressing..." : "Compress All Data"}
                  </Button>

                  {compressionResult && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h4 className="font-medium">Compression Complete</h4>
                      <p className="text-sm">
                        {compressionResult.processed} items processed, {formatSize(compressionResult.saved)} saved
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Cached Items</p>
                    <p className="text-2xl font-bold">{mockStats.totalItems}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Compression Ratio</p>
                    <p className="text-2xl font-bold">{mockStats.compressionRatio.toFixed(2)}x</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Original Size</p>
                    <p className="text-2xl font-bold">{formatSize(mockStats.totalSize)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Compressed Size</p>
                    <p className="text-2xl font-bold">{formatSize(mockStats.compressedSize)}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Space Used</span>
                    <span>{mockStats.usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${mockStats.usagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(mockStats.compressedSize)} used of {formatSize(quota)} quota
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Data Types</p>
                  <div className="space-y-2">
                    {Object.entries(mockStats.itemsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span>
                          {count} item{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Optimization Suggestions</p>
                  <ul className="space-y-1">
                    {mockAnalysis.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="text-sm pl-5 relative before:content-['•'] before:absolute before:left-0"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Largest Cached Items</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockAnalysis.largestItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm border-b pb-1">
                        <span className="truncate max-w-[70%]" title={item.key}>
                          {item.key}
                        </span>
                        <span className="text-right">
                          <span className="text-xs bg-muted px-1 py-0.5 rounded mr-2">{item.type}</span>
                          {formatSize(item.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={cleanupCache}>
            Clean Cache
          </Button>
          <Button onClick={saveSettings}>Save</Button>
        </div>
      </Card>
    </div>
  )
}
