import { StockGrid } from "@/components/stock-grid"
import { StockDetailModal } from "@/components/stock-detail-modal"
import { ApiStatus } from "@/components/api-status"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Stock Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-gray-500">Track the performance of popular stocks</p>
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-amber-300 text-white border-0">
            Premium
          </Badge>
        </div>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Database className="h-3 w-3 mr-1" />
          <span>Using local caching to reduce API calls</span>
        </div>
      </div>

      <ApiStatus />
      <StockGrid />
      <StockDetailModal />
      <DebugInfo />

      <footer className="text-center mt-16 mb-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Stock Dashboard. All data is provided by Alpha Vantage.
        <div className="mt-2">
          <span className="text-xs">
            Using free tier API (25 requests/day) with local caching.
            <a
              href="https://www.alphavantage.co/premium/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              Upgrade to premium
            </a>
          </span>
        </div>
      </footer>
    </main>
  )
}
