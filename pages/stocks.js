"use client"

import { useState, useEffect } from "react"
import { popularStocks, getStockData } from "../services/stockService"

export default function StocksPage() {
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    // Récupérer les données des actions populaires
    const stockData = popularStocks.map((symbol) => getStockData(symbol))
    setStocks(stockData)
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Popular Stocks</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            <strong>{stock.symbol}</strong>: {stock.name} - ${stock.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
