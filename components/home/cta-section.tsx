"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function CtaSection() {
  return (
    <div className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-4 sm:mb-6">
            Prêt à transformer votre approche d'investissement?
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-blue-100">
            Rejoignez des milliers d'investisseurs qui utilisent notre plateforme pour prendre de meilleures décisions
            d'investissement. L'inscription est gratuite et ne prend que quelques secondes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/auth">
                Créer un compte gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
              <Link href="/market-predictions">Découvrir les fonctionnalités</Link>
            </Button>
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-blue-100">
            Aucune carte de crédit requise. Commencez gratuitement et passez à un forfait premium quand vous le
            souhaitez.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
