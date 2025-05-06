import { popularStocks, getStockData } from "../lib/stock-service"

export default function StocksPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Popular Stocks</h1>
      <ul>
        {popularStocks.map((symbol) => {
          const stock = getStockData(symbol)
          return (
            <li key={symbol} style={{ marginBottom: "10px" }}>
              <strong>{stock.symbol}</strong>: {stock.name} - ${stock.price}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
