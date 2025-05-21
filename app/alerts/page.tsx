import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BellRing, Bell, BellOff } from "lucide-react"

export default function AlertsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Alerts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellRing className="mr-2 h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Alerts that are currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded bg-yellow-50">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <BellRing className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-800">AAPL price alert</h3>
                    <p className="text-sm text-yellow-700">Price dropped below $150</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-yellow-600">Triggered 25 minutes ago</span>
                      <Button variant="ghost" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded bg-blue-50">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <BellRing className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Market update</h3>
                    <p className="text-sm text-blue-700">S&P 500 gained 1.2% today</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-blue-600">Triggered 2 hours ago</span>
                      <Button variant="ghost" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Alert Settings
            </CardTitle>
            <CardDescription>Configure your alert preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Price alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about price changes</p>
                </div>
                <div className="h-4 w-8 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Market news</p>
                  <p className="text-sm text-muted-foreground">Daily market updates</p>
                </div>
                <div className="h-4 w-8 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Prediction alerts</p>
                  <p className="text-sm text-muted-foreground">AI-based stock predictions</p>
                </div>
                <div className="h-4 w-8 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellOff className="mr-2 h-5 w-5" />
            Muted Alerts
          </CardTitle>
          <CardDescription>Alerts you've temporarily muted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-muted-foreground">
            <p>No muted alerts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
