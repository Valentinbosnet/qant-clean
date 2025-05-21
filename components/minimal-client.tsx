"use client"

import { useState } from "react"

export function MinimalClient() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Composant Client Minimal</h2>
      <p className="mb-2">Compteur: {count}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setCount(count + 1)}
      >
        Incrémenter
      </button>
    </div>
  )
}
