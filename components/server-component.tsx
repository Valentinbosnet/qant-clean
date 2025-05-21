export function ServerComponent() {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Composant Serveur</h2>
      <p>Ce composant est rendu côté serveur.</p>
      <p>Heure de rendu: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}
