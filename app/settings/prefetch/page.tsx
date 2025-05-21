import { PrefetchSettings } from "@/components/prefetch-settings"

export default function PrefetchSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Préchargement intelligent</h1>
      <PrefetchSettings />
    </div>
  )
}
