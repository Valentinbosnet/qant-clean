export default function Stocks() {
  // Données en dur pour éviter les problèmes d'import
  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Popular Stocks</h1>

      <div style={{ marginTop: "20px" }}>
        {popularStocks.map((symbol) => (
          <div
            key={symbol}
            style={{
              border: "1px solid #eaeaea",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "10px",
            }}
          >
            <h2>{symbol}</h2>
            <p>
              {symbol === "AAPL"
                ? "Apple Inc."
                : symbol === "MSFT"
                  ? "Microsoft Corporation"
                  : symbol === "GOOGL"
                    ? "Alphabet Inc."
                    : symbol === "AMZN"
                      ? "Amazon.com, Inc."
                      : symbol === "META"
                        ? "Meta Platforms, Inc."
                        : symbol === "TSLA"
                          ? "Tesla, Inc."
                          : symbol + " Inc."}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Price: ${Math.floor(Math.random() * 500 + 100)}</span>
              <span
                style={{
                  color: Math.random() > 0.5 ? "green" : "red",
                }}
              >
                {Math.random() > 0.5 ? "+" : "-"}
                {(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <a
          href="/"
          style={{
            color: "blue",
            textDecoration: "underline",
          }}
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
