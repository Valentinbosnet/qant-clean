import { OfflinePriorityManager } from "@/components/offline-priority-manager"

export default function PrioritiesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Priorités des données hors ligne</h1>
      <OfflinePriorityManager />
    </div>
  )
}
