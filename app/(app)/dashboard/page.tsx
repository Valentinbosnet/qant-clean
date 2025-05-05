import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RealTimeAnalysis from "@/components/real-time-analysis"
import { popularStocks } from "@/lib/stock-service"

export default function DashboardPage() {
  // Use the first stock from popular stocks for the analysis
  const featuredStock = popularStocks[0] || "AAPL"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Your financial insights dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Track your investments, analyze market trends, and get real-time predictions all in one place.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>Latest market trends and indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The market is currently showing mixed signals with technology stocks leading gains while energy sectors
              face pressure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
            <CardDescription>Summary of your investments</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and manage your portfolio to track performance and make informed decisions.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RealTimeAnalysis symbol={featuredStock} />

        <Card>
          <CardHeader>
            <CardTitle>Popular Stocks</CardTitle>
            <CardDescription>Trending stocks to watch</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {popularStocks.slice(0, 5).map((stock) => (
                <li key={stock} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="font-medium">{stock}</span>
                  <span className="text-sm text-gray-500">
                    {Math.random() > 0.5 ? (
                      <span className="text-green-500">↑ {(Math.random() * 5).toFixed(2)}%</span>
                    ) : (
                      <span className="text-red-500">↓ {(Math.random() * 5).toFixed(2)}%</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
