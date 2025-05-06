export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Stock Analysis App</h1>
      <p>Welcome to the Stock Analysis Application</p>

      <div style={{ marginTop: "20px" }}>
        <h2>Popular Stocks</h2>
        <ul>
          <li>Apple (AAPL) - $150.25</li>
          <li>Microsoft (MSFT) - $310.80</li>
          <li>Google (GOOGL) - $2,750.15</li>
          <li>Amazon (AMZN) - $3,320.75</li>
          <li>Meta (META) - $325.60</li>
        </ul>
      </div>
    </div>
  )
}
