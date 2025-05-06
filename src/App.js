"use client"

import { useState, useEffect } from "react"
import "./App.css"
import { popularStocks, getMultipleStocks } from "./lib/stock-service"

function App() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching stock data
    const fetchStocks = () => {
      setLoading(true)
      try {
        const stockData = getMultipleStocks(popularStocks)
        setStocks(stockData)
      } catch (error) {
        console.error("Error fetching stocks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Analysis App</h1>
      </header>
      <main className="App-main">
        <section className="stock-section">
          <h2>Popular Stocks</h2>
          {loading ? (
            <p>Loading stocks...</p>
          ) : (
            <ul className="stock-list">
              {stocks.map((stock) => (
                <li key={stock.symbol} className="stock-item">
                  <div className="stock-name">{stock.name}</div>
                  <div className="stock-symbol">{stock.symbol}</div>
                  <div className="stock-price">${stock.currentPrice.toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer className="App-footer">
        <p>© 2023 Stock Analysis App</p>
      </footer>
    </div>
  )
}

export default App
