"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function ConfigurableHome() {
  const [isEditMode, setIsEditMode] = useState(false)

  return (
    <div className="container mx-auto px-4 py-4">
      {/* En-tête simple */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
          <Settings className="mr-2 h-4 w-4" />
          {isEditMode ? "Quitter l'édition" : "Personnaliser"}
        </Button>
      </div>

      {/* Grille de widgets statique */}
      <div
        className={`
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
        ${isEditMode ? "border-2 border-dashed border-gray-200 p-4 rounded-lg" : ""}
      `}
      >
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="font-semibold mb-2">Aperçu du marché</h2>
          <p>Contenu statique du widget</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="font-semibold mb-2">Actualités</h2>
          <p>Contenu statique du widget</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="font-semibold mb-2">Favoris</h2>
          <p>Contenu statique du widget</p>
        </div>
      </div>

      {/* Message d'aide en mode édition */}
      {isEditMode && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
          Mode édition activé. Dans la version complète, vous pourriez déplacer et redimensionner les widgets.
        </div>
      )}
    </div>
  )
}
