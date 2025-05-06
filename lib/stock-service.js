import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Liste des actions populaires
export const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "META", name: "Meta Platforms, Inc." },
]

// Fonction pour obtenir les données d'une action
export function getStockData(symbol) {
  return {
    symbol,
    name: popularStocks.find((stock) => stock.symbol === symbol)?.name || "Unknown Company",
    currentPrice: 150.25,
    previousPrice: 145.75,
    change: 4.5,
    percentChange: 3.09,
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      price: Math.random() * 50 + 100,
    })),
    isSimulated: true,
  }
}

// Fonction pour obtenir une cotation d'action
export function getStockQuote(symbol) {
  return {
    symbol,
    price: 150.25,
    change: 4.5,
    percentChange: 3.09,
    volume: 1234567,
    marketCap: "2.45T",
    peRatio: 28.2,
    dividend: 0.82,
    yield: 0.55,
    isSimulated: true,
  }
}

// Fonction pour obtenir l'historique des prix
export function getStockHistory(symbol) {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    open: Math.random() * 50 + 100,
    high: Math.random() * 50 + 110,
    low: Math.random() * 50 + 90,
    close: Math.random() * 50 + 100,
    volume: Math.floor(Math.random() * 10000000),
  }))
}

// Fonction pour obtenir plusieurs actions
export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => getStockData(symbol))
}

// Fonction pour générer une carte d'action
export function StockCard({ symbol }) {
  const stock = getStockData(symbol)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stock.symbol}</CardTitle>
        <p>{stock.name}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${stock.currentPrice.toFixed(2)}</span>
          <Badge variant={stock.change > 0 ? "default" : "destructive"}>
            {stock.change > 0 ? "+" : ""}
            {stock.percentChange.toFixed(2)}%
          </Badge>
        </div>
        <Progress value={50} className="mt-4" />
        <Button className="w-full mt-4">View Details</Button>
      </CardContent>
    </Card>
  )
}
