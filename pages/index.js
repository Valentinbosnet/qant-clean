"use client"

import { useState, useEffect } from "react"
import { popularStocks, getMultipleStocks } from "../lib/stock-service"

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStocks() {
      try {
        const stockData = await getMultipleStocks(popularStocks)
        setStocks(stockData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading stocks:", error)
        setLoading(false)
      }
    }

    loadStocks()
    const interval = setInterval(loadStocks, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <h1>Stock Dashboard</h1>

      {loading ? (
        <div className="loading">Loading stock data...</div>
      ) : (
        <div className="stock-grid">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="stock-card">
              <div className="stock-symbol">{stock.symbol}</div>
              <div className="stock-name">{stock.name}</div>
              <div className={`stock-price ${stock.change >= 0 ? "positive" : "negative"}`}>
                ${stock.price.toFixed(2)}
              </div>
              <div className={`stock-change ${stock.change >= 0 ? "positive" : "negative"}`}>
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .loading {
          text-align: center;
          font-size: 18px;
          margin: 50px 0;
        }
        
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .stock-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        
        .stock-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
        }
        
        .stock-symbol {
          font-size: 24px;
          font-weight: bold;
        }
        
        .stock-name {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .stock-price {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stock-change {
          font-size: 16px;
        }
        
        .positive {
          color: #0a9e01;
        }
        
        .negative {
          color: #e41919;
        }
      `}</style>
    </div>
  )
}
