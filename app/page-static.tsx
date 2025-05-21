export default function HomePageStatic() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord (Version Statique)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="font-semibold mb-2">Aperçu du marché</h2>
            <p>Contenu statique du widget</p>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="font-semibold mb-2">Actualités</h2>
            <p>Contenu statique du widget</p>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="font-semibold mb-2">Favoris</h2>
            <p>Contenu statique du widget</p>
          </div>
        </div>
      </div>
    </main>
  )
}
