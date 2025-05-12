import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Settings } from "lucide-react"

export default function SectorAlertsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Alertes Sectorielles</h1>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="mb-6">
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Préférences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Sectorielles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
