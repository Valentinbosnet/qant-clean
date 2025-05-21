"use client"

import { useState } from "react"

export function ConditionalRender() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Rendu Conditionnel</h2>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Masquer les détails" : "Afficher les détails"}
      </button>

      {showDetails && (
        <div className="p-3 bg-gray-100 rounded">
          <p>Ces détails sont affichés conditionnellement.</p>
          <p className="mt-2 text-sm text-gray-600">Cliquez sur le bouton pour les masquer.</p>
        </div>
      )}
    </div>
  )
}
