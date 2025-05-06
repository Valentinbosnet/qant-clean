import { popularStocks } from "../lib/stock-service"

export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>This page tests the imports from stock-service</p>
      <pre>{JSON.stringify(popularStocks, null, 2)}</pre>
    </div>
  )
}
