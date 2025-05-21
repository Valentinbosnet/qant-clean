import { OfflineModeSettings } from "@/components/offline-mode-settings"

export default function OfflineSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres du mode hors ligne</h1>
      <OfflineModeSettings />
    </div>
  )
}

// Désactiver le prérendu statique pour cette page
export const dynamic = "force-dynamic"
