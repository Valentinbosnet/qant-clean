export default function StatelessPage() {
  // Fonction pour générer un nombre aléatoire entre 1 et 100
  const randomNumber = Math.floor(Math.random() * 100) + 1

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Page Sans État</h1>
      <p className="mb-4">
        Cette page n'utilise aucun état React. Elle génère simplement un nombre aléatoire lors du rendu.
      </p>
      <div className="p-4 bg-gray-100 rounded-lg">
        Nombre aléatoire: <span className="font-bold">{randomNumber}</span>
      </div>
      <p className="mt-4 text-sm text-gray-500">Rafraîchissez la page pour générer un nouveau nombre.</p>
    </div>
  )
}
