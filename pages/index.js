export default function Home() {
  // Données en dur, pas d'imports
  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 150.25 },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 290.17 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.3 },
    { symbol: "AMZN", name: "Amazon.com, Inc.", price: 3200.47 },
    { symbol: "META", name: "Meta Platforms, Inc.", price: 330.12 },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 800.75 },
  ]

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Stock App</h1>
      <p>Welcome to the Stock App!</p>

      <h2>Popular Stocks</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            <strong>{stock.symbol}</strong>: {stock.name} - ${stock.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  )
}
