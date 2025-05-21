import { ServerComponent } from "@/components/server-component"

export default function ServerOnlyPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Page avec Composant Serveur</h1>
      <ServerComponent />
    </div>
  )
}
