"use client"
import { useEffect, useRef, useState } from "react"

interface StockChartProps {
  data: { timestamp: string; price: number }[]
  color?: string
  height?: number
}

export default function StockChart({ data, color = "#10b981", height = 200 }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Vérifier si nous avons suffisamment de données
    if (!data || data.length < 2) {
      setError("Pas assez de données pour afficher le graphique")
      return
    }

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        setError("Impossible d'initialiser le contexte du canvas")
        return
      }

      // Définir les dimensions du canvas
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Extraire les prix pour trouver les min/max
      const prices = data.map((d) => d.price)
      const minPrice = Math.min(...prices) * 0.99 // Ajouter une marge de 1%
      const maxPrice = Math.max(...prices) * 1.01 // Ajouter une marge de 1%
      const priceRange = maxPrice - minPrice

      // Calculer les échelles
      const xScale = rect.width / (data.length - 1)
      const yScale = rect.height / priceRange

      // Dessiner la grille
      ctx.strokeStyle = "#374151"
      ctx.lineWidth = 0.5
      ctx.beginPath()

      // Lignes horizontales
      const numHorizontalLines = 5
      for (let i = 0; i <= numHorizontalLines; i++) {
        const y = rect.height - (i / numHorizontalLines) * rect.height
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)

        // Ajouter les étiquettes de prix
        if (i > 0 && i < numHorizontalLines) {
          const price = minPrice + (i / numHorizontalLines) * priceRange
          ctx.fillStyle = "#9CA3AF"
          ctx.font = "10px sans-serif"
          ctx.textAlign = "left"
          ctx.fillText(`${price.toFixed(2)}`, 5, y - 5)
        }
      }

      // Lignes verticales et étiquettes de temps
      const numVerticalLines = Math.min(data.length, 6)
      for (let i = 0; i <= numVerticalLines; i++) {
        const x = (i / numVerticalLines) * rect.width
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)

        // Ajouter les étiquettes de temps
        if (i > 0 && i < numVerticalLines && data.length > 0) {
          const dataIndex = Math.floor((i / numVerticalLines) * (data.length - 1))
          const date = new Date(data[dataIndex].timestamp)
          const timeLabel = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })

          ctx.fillStyle = "#9CA3AF"
          ctx.font = "10px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(timeLabel, x, rect.height - 5)
        }
      }
      ctx.stroke()

      // Dessiner la ligne du graphique
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = i * xScale
        const y = rect.height - ((d.price - minPrice) / priceRange) * rect.height
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Ajouter une zone de remplissage sous la ligne
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
      gradient.addColorStop(0, `${color}33`) // 20% d'opacité
      gradient.addColorStop(1, `${color}00`) // 0% d'opacité

      ctx.fillStyle = gradient
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = i * xScale
        const y = rect.height - ((d.price - minPrice) / priceRange) * rect.height
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.lineTo(rect.width, rect.height)
      ctx.lineTo(0, rect.height)
      ctx.closePath()
      ctx.fill()

      // Prix minimum et maximum
      ctx.fillStyle = "#9CA3AF"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Min: ${minPrice.toFixed(2)}`, 5, rect.height - 5)
      ctx.textAlign = "right"
      ctx.fillText(`Max: ${maxPrice.toFixed(2)}`, rect.width - 5, 15)

      // Prix actuel (dernier point)
      const currentPrice = data[data.length - 1].price
      ctx.fillStyle = "#F9FAFB"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${currentPrice.toFixed(2)}`, rect.width - 5, 35)

      // Réinitialiser l'erreur si tout s'est bien passé
      setError(null)
    } catch (err) {
      console.error("Erreur lors du rendu du graphique:", err)
      setError("Erreur lors du rendu du graphique")
    }
  }, [data, color, height])

  // Formater les données pour afficher les dates correctement
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Forcer l'affichage dans le fuseau horaire local de l'utilisateur
    return (
      date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Format 24h
      })
    )
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 text-gray-400">{error}</div>
      )}

      {/* Légende des dates */}
      {data && data.length >= 2 && (
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>{formatDate(data[0].timestamp)}</span>
          <span>{formatDate(data[data.length - 1].timestamp)}</span>
        </div>
      )}
    </div>
  )
}
