import { popularStocks, getStockQuote } from "../lib/stock-service"

export default function LibStocksPage() {
  return (
    <div>
      <h1>Popular Stocks (from lib)</h1>
      <ul>
        {popularStocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.symbol} - {stock.name}
          </li>
        ))}
      </ul>
      <h2>Sample Quote (from lib)</h2>
      <pre>{JSON.stringify(getStockQuote("AAPL"), null, 2)}</pre>
    </div>
  )
}
