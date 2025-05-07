import { StockGrid } from "@/components/stock-grid"
import { StockDetailModal } from "@/components/stock-detail-modal"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Stock Dashboard</h1>
      <p className="text-gray-500 text-center mb-8">Track the performance of popular stocks</p>

      <StockGrid />
      <StockDetailModal />

      <footer className="text-center mt-16 mb-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Stock Dashboard. All data is simulated for demonstration purposes.
      </footer>
    </main>
  )
}
