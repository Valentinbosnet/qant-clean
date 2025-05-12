"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BellOff, Save, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sectorAlertsService, type SectorAlertPreferences } from "@/lib/sector-alerts-service"
import type { SectorType } from "@/lib/sector-classification"

interface SectorAlertsPreferencesProps {
  userId?: string
  onSave?: () => void
}

export function SectorAlertsPreferences({ userId, onSave }: SectorAlertsPreferencesProps) {
  const [preferences, setPreferences] = useState<SectorAlertPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    setLoading(true)
    try {
      const userPreferences = await sectorAlertsService.getPreferences(userId)
      setPreferences(userPreferences)
    } catch (error) {
      console.error("Error loading sector alert preferences:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les préférences d'alertes sectorielles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!preferences) return

    try {
      await sectorAlertsService.updatePreferences(preferences)
      toast({
        title: "Préférences enregistrées",
        description: "Vos préférences d'alertes sectorielles ont été mises à jour",
        variant: "success",
      })
      if (onSave) onSave()
    } catch (error) {
      console.error("Error saving sector alert preferences:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les préférences d'alertes sectorielles",
        variant: "destructive",
      })
    }
  }

  const toggleSector = (sector: SectorType) => {
    if (!preferences) return

    const enabledSectors = preferences.enabledSectors.includes(sector)
      ? preferences.enabledSectors.filter((s) => s !== sector)
      : [...preferences.enabledSectors, sector]

    setPreferences({
      ...preferences,
      enabledSectors,
    })
  }

  const getSectorName = (sector: SectorType): string => {
    const sectorNames: Record<SectorType, string> = {
      technology: "Technologie",
      healthcare: "Santé",
      financial: "Finance",
      consumer: "Consommation",
      industrial: "Industrie",
      energy: "Énergie",
      utilities: "Services publics",
      materials: "Matériaux",
      communication: "Communication",
      real_estate: "Immobilier",
      unknown: "Autre",
    }

    return sectorNames[sector]
  }

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Préférences d'alertes sectorielles
          </CardTitle>
          <CardDescription>Chargement des préférences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Préférences d'alertes sectorielles
        </CardTitle>
        <CardDescription>Personnalisez vos notifications pour les indicateurs sectoriels</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="sectors">
          <TabsList className="mb-4">
            <TabsTrigger value="sectors">Secteurs</TabsTrigger>
            <TabsTrigger value="thresholds">Seuils</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="sectors" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Secteurs surveillés</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionnez les secteurs pour lesquels vous souhaitez recevoir des alertes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "technology",
                  "healthcare",
                  "financial",
                  "consumer",
                  "industrial",
                  "energy",
                  "utilities",
                  "materials",
                  "communication",
                  "real_estate",
                ].map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sector-${sector}`}
                      checked={preferences.enabledSectors.includes(sector as SectorType)}
                      onCheckedChange={() => toggleSector(sector as SectorType)}
                    />
                    <Label htmlFor={`sector-${sector}`} className="flex-1">
                      {getSectorName(sector as SectorType)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      enabledSectors: [
                        "technology",
                        "healthcare",
                        "financial",
                        "consumer",
                        "industrial",
                        "energy",
                        "utilities",
                        "materials",
                        "communication",
                        "real_estate",
                      ],
                    })
                  }
                >
                  Tout sélectionner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      enabledSectors: [],
                    })
                  }
                >
                  Tout désélectionner
                </Button>
              </div>
              <Badge variant="outline">{preferences.enabledSectors.length} secteur(s) sélectionné(s)</Badge>
            </div>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Seuil de changement minimum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Recevez des alertes uniquement lorsque le changement dépasse ce pourcentage
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Seuil actuel: {preferences.minChangeThreshold}%</span>
                  </div>
                  <Slider
                    value={[preferences.minChangeThreshold]}
                    min={1}
                    max={20}
                    step={0.5}
                    onValueChange={(value) =>
                      setPreferences({
                        ...preferences,
                        minChangeThreshold: value[0],
                      })
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1% (Sensible)</span>
                    <span>10%</span>
                    <span>20% (Important)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Niveau d'importance minimum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Filtrez les alertes en fonction de leur niveau d'importance
                </p>

                <RadioGroup
                  value={preferences.minImportanceLevel}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      minImportanceLevel: value as "high" | "medium" | "low",
                    })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="importance-high" />
                    <Label htmlFor="importance-high">Haute importance uniquement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="importance-medium" />
                    <Label htmlFor="importance-medium">Importance moyenne et haute</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="importance-low" />
                    <Label htmlFor="importance-low">Toutes les alertes</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Canaux de notification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choisissez comment vous souhaitez être notifié des changements
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-inapp">Notifications dans l'application</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes dans le centre de notifications de l'application
                  </p>
                </div>
                <Switch
                  id="notifications-inapp"
                  checked={preferences.notificationChannels.inApp}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notificationChannels: {
                        ...preferences.notificationChannels,
                        inApp: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-email">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes par email (nécessite une adresse email vérifiée)
                  </p>
                </div>
                <Switch
                  id="notifications-email"
                  checked={preferences.notificationChannels.email}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notificationChannels: {
                        ...preferences.notificationChannels,
                        email: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-push">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes push sur votre appareil (nécessite une autorisation)
                  </p>
                </div>
                <Switch
                  id="notifications-push"
                  checked={preferences.notificationChannels.push}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notificationChannels: {
                        ...preferences.notificationChannels,
                        push: checked,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    notificationChannels: {
                      inApp: false,
                      email: false,
                      push: false,
                    },
                  })
                }
              >
                <BellOff className="h-4 w-4 mr-2" />
                Désactiver toutes les notifications
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadPreferences}>
          Annuler
        </Button>
        <Button onClick={handleSavePreferences}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les préférences
        </Button>
      </CardFooter>
    </Card>
  )
}
