import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BellOffIcon, Settings2Icon } from "lucide-react"

export default function AlertsPage() {
  // In a real app, this would fetch actual alerts data
  const mockAlerts = [
    { id: 1, symbol: "AAPL", type: "price", condition: "above", value: 180, enabled: true },
    { id: 2, symbol: "MSFT", type: "price", condition: "below", value: 350, enabled: false },
    { id: 3, symbol: "TSLA", type: "volume", condition: "above", value: 100000000, enabled: true },
  ]

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <Button variant="outline" size="sm">
          <Settings2Icon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="create">Create Alert</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4">
            {(mockAlerts || []).map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{alert.symbol}</CardTitle>
                    <Switch checked={alert.enabled} />
                  </div>
                  <CardDescription>{alert.type === "price" ? "Price Alert" : "Volume Alert"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Trigger when {alert.symbol} {alert.type} is {alert.condition} {alert.type === "price" ? "$" : ""}
                    {alert.type === "volume" ? alert.value.toLocaleString() : alert.value}
                  </p>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(mockAlerts || []).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BellOffIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No active alerts</p>
                  <Button>Create Your First Alert</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No alert history available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>Set up notifications for price changes and other events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Alert creation form would go here</p>
              <Button>Save Alert</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
