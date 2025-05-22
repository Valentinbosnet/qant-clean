export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function TestOpenAIPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Test de l'API OpenAI</h1>
        <p className="text-gray-500 text-center max-w-2xl">
          Cette page effectue différents tests pour vérifier si l'API OpenAI est correctement configurée et
          fonctionnelle.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Cette page est en cours de chargement. Les tests de l'API OpenAI seront disponibles après le déploiement
              complet.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Test simple card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Test simplifié de l'API OpenAI</h2>
          <p className="text-gray-600 mb-4">
            Ce test vérifie si votre clé API OpenAI est correctement configurée et fonctionnelle
          </p>
          <div className="bg-gray-100 rounded-md p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled
            >
              Vérifier
            </button>
          </div>
        </div>

        {/* Test de prédiction card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Test de l'API de prédiction IA</h2>
          <p className="text-gray-600 mb-4">
            Ce test vérifie si l'API de prédiction IA peut générer des prédictions pour AAPL
          </p>
          <div className="bg-gray-100 rounded-md p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled
            >
              Vérifier
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Guide de résolution des problèmes</h2>
        <p className="text-gray-600 mb-4">
          Si vous rencontrez des problèmes avec l'API OpenAI, suivez ces étapes pour les résoudre
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">1. Vérifiez la clé API OpenAI</h3>
            <p className="text-sm text-gray-500">
              Assurez-vous que votre clé API OpenAI est correctement configurée dans les variables d'environnement de
              Vercel.
            </p>
          </div>

          <div>
            <h3 className="font-medium">2. Redéployez l'application</h3>
            <p className="text-sm text-gray-500">
              Après avoir configuré la clé API, redéployez l'application pour que les changements prennent effet.
            </p>
          </div>

          <div>
            <h3 className="font-medium">3. Vérifiez les logs</h3>
            <p className="text-sm text-gray-500">
              Consultez les logs de déploiement et d'exécution dans le dashboard Vercel pour identifier d'éventuelles
              erreurs.
            </p>
          </div>

          <div>
            <h3 className="font-medium">4. Testez la clé API directement</h3>
            <p className="text-sm text-gray-500">
              Vérifiez que votre clé API fonctionne correctement en la testant directement sur le site d'OpenAI.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
