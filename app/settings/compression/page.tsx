import { OfflineCompressionSettings } from "@/components/offline-compression-settings"

export default function CompressionSettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Compression Settings</h1>
      <OfflineCompressionSettings />
    </div>
  )
}
