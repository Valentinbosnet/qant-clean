export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return new Response(JSON.stringify({ error: "Symbol parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Simple mock data
  const stockData = {
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100 + Math.random() * 50,
    previousClose: 90 + Math.random() * 50,
    change: Math.random() * 10 - 5,
    changePercent: Math.random() * 5 - 2.5,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    lastUpdated: new Date().toISOString(),
  }

  return new Response(JSON.stringify(stockData), {
    headers: { "Content-Type": "application/json" },
  })
}
