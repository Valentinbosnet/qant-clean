import { popularStocks, getStockQuote } from "../services/stockService"

export default function StocksPage() {
  return (
    <div>
      <h1>Popular Stocks</h1>
      <ul>
        {popularStocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.symbol} - {stock.name}
          </li>
        ))}
      </ul>
      <h2>Sample Quote</h2>
      <pre>{JSON.stringify(getStockQuote("AAPL"), null, 2)}</pre>
    </div>
  )
}
