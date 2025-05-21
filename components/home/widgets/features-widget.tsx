import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, BarChart2, Bell, Zap, TrendingUp } from "lucide-react"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface FeaturesWidgetProps {
  config: HomeWidgetConfig
}

export function FeaturesWidget({ config }: FeaturesWidgetProps) {
  const features = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Recherche avancée",
      description: "Trouvez rapidement des actions par nom, symbole ou secteur",
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Favoris",
      description: "Suivez vos actions préférées en un coup d'œil",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Prédictions IA",
      description: "Obtenez des prédictions basées sur l'intelligence artificielle",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Alertes personnalisées",
      description: "Soyez notifié des mouvements importants du marché",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Analyse en temps réel",
      description: "Données de marché actualisées en continu",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Suivi de performance",
      description: "Mesurez la performance de vos investissements",
    },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Fonctionnalités principales</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="bg-primary/10 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-3">
                {React.cloneElement(feature.icon, { className: "h-5 w-5 text-primary" })}
              </div>
              <h4 className="font-medium mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
