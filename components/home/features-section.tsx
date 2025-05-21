"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Star, BarChart3, Bell, LineChart, Zap, Shield, Newspaper } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: <TrendingUp className="h-10 w-10 text-blue-500" />,
    title: "Suivi en temps réel",
    description: "Suivez les performances de vos actions préférées avec des données mises à jour en temps réel.",
  },
  {
    icon: <Star className="h-10 w-10 text-amber-500" />,
    title: "Liste de favoris",
    description: "Créez votre liste personnalisée d'actions favorites pour un accès rapide et facile.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-purple-500" />,
    title: "Prédictions IA",
    description:
      "Obtenez des prédictions basées sur l'intelligence artificielle pour vous aider dans vos décisions d'investissement.",
  },
  {
    icon: <Bell className="h-10 w-10 text-red-500" />,
    title: "Alertes personnalisées",
    description: "Configurez des alertes pour être notifié des mouvements importants sur vos actions.",
  },
  {
    icon: <LineChart className="h-10 w-10 text-green-500" />,
    title: "Analyse technique",
    description: "Accédez à des outils d'analyse technique avancés pour approfondir votre compréhension du marché.",
  },
  {
    icon: <Newspaper className="h-10 w-10 text-indigo-500" />,
    title: "Actualités financières",
    description: "Restez informé avec les dernières actualités financières et leur impact sur vos investissements.",
  },
  {
    icon: <Zap className="h-10 w-10 text-yellow-500" />,
    title: "Dashboard personnalisable",
    description: "Créez votre propre tableau de bord avec les widgets qui vous intéressent le plus.",
  },
  {
    icon: <Shield className="h-10 w-10 text-teal-500" />,
    title: "Sécurité des données",
    description: "Vos données sont sécurisées et protégées avec les dernières technologies de cryptage.",
  },
]

export function FeaturesSection() {
  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-3 sm:mb-4">
            Tout ce dont vous avez besoin pour vos investissements
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Notre plateforme combine des données en temps réel, des analyses avancées et des prédictions basées sur l'IA
            pour vous aider à prendre de meilleures décisions d'investissement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
