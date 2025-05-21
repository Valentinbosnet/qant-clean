import { Button } from "@/components/ui/button"

export default function MinimalPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Page Minimale</h1>
      <p className="mb-4">Cette page utilise un minimum d'imports.</p>
      <Button>Bouton Simple</Button>
    </div>
  )
}
