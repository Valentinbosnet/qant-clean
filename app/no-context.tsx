"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function NoContextPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Page Sans Contexte</h1>
      <p className="mb-4">Compteur: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Incrémenter</Button>
    </div>
  )
}
