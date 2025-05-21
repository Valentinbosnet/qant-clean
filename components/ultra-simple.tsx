"use client"

import { useState } from "react"

export function UltraSimple() {
  const [clicked, setClicked] = useState(false)

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>Composant Ultra Simple</h2>
      <p>État: {clicked ? "Cliqué" : "Non cliqué"}</p>
      <button
        onClick={() => setClicked(!clicked)}
        style={{
          padding: "8px 16px",
          backgroundColor: clicked ? "green" : "blue",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Cliquez-moi
      </button>
    </div>
  )
}
