"use client"

import { useState } from "react"

export default function NoImportsPage() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Page Sans Imports Personnalisés</h1>
      <p>Compteur: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Incrémenter
      </button>
    </div>
  )
}
