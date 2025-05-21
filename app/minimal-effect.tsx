"use client"

import { useState, useEffect } from "react"

export default function MinimalEffectPage() {
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    // Effet simple qui met à jour l'heure toutes les secondes
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, []) // Dépendance vide pour n'exécuter qu'une seule fois

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Page avec Effet Minimal</h1>
      <p>Heure actuelle: {time}</p>
    </div>
  )
}
