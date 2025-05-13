import AlphaVantageDiagnostic from "@/components/api/alpha-vantage-diagnostic"

export default function AlphaVantagePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnostic Alpha Vantage</h1>
      <AlphaVantageDiagnostic />
    </div>
  )
}
