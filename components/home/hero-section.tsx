"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, LineChart } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
      {/* Formes décoratives */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-indigo-400 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-12 sm:px-6 sm:py-24 lg:py-32 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-6xl mb-4 sm:mb-6">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Suivez et analysez
                </span>
                <span className="block">vos investissements</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                Prenez des décisions d'investissement éclairées grâce à notre plateforme d'analyse boursière alimentée
                par l'IA. Suivez vos actions préférées, obtenez des prédictions personnalisées et restez informé des
                tendances du marché.
              </p>
            </motion.div>

            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Link href="/auth">
                  Commencer gratuitement
                  <ArrowRight
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${isHovered ? "transform translate-x-1" : ""}`}
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/market-predictions">Découvrir les prédictions</Link>
              </Button>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm">Données sécurisées</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm">Analyses en temps réel</span>
              </div>
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm">Prédictions IA</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:block hidden"
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="/placeholder-0bigz.png"
                alt="Dashboard de suivi boursier"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-center gap-2 text-green-500 font-semibold">
                <TrendingUp className="h-5 w-5" />
                <span>+12.4%</span>
              </div>
              <p className="text-sm mt-1">Prédiction pour AAPL sur 30 jours</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
