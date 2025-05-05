export default function HelpPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Centre d'aide</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Bienvenue dans le centre d'aide</h2>
        <p className="text-gray-300 mb-4">
          Cette page contient des ressources pour vous aider à utiliser l'application TradeAssist. Vous trouverez
          ci-dessous des guides, tutoriels et réponses aux questions fréquentes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Guide de démarrage</h3>
          <p className="text-gray-300 mb-4">
            Apprenez les bases de l'utilisation de TradeAssist pour gérer vos investissements.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Création de votre premier portfolio</li>
            <li>Ajout de transactions</li>
            <li>Suivi de vos performances</li>
            <li>Utilisation des prédictions IA</li>
          </ul>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">FAQ</h3>
          <p className="text-gray-300 mb-4">Réponses aux questions fréquemment posées.</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Comment modifier mon mot de passe ?</li>
            <li>Comment ajouter des fonds à mon portfolio ?</li>
            <li>Comment fonctionnent les prédictions IA ?</li>
            <li>Est-ce que mes données sont sécurisées ?</li>
            <li>Comment contacter le support ?</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">Contacter le support</h3>
        <p className="text-gray-300 mb-4">
          Notre équipe de support est disponible pour vous aider avec toutes vos questions.
        </p>
        <div className="space-y-2">
          <p className="text-gray-300">
            <strong>Email:</strong> support@tradeassist.com
          </p>
          <p className="text-gray-300">
            <strong>Téléphone:</strong> +33 1 23 45 67 89
          </p>
          <p className="text-gray-300">
            <strong>Horaires:</strong> Du lundi au vendredi, 9h-18h
          </p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Tutoriels vidéo</h3>
        <p className="text-gray-300 mb-4">
          Consultez nos tutoriels vidéo pour apprendre à utiliser toutes les fonctionnalités de TradeAssist.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white mb-2">Introduction à TradeAssist</h4>
            <p className="text-gray-300 text-sm">Durée: 5:30</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white mb-2">Gestion des portfolios</h4>
            <p className="text-gray-300 text-sm">Durée: 8:15</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white mb-2">Analyse des performances</h4>
            <p className="text-gray-300 text-sm">Durée: 7:45</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white mb-2">Utilisation des prédictions IA</h4>
            <p className="text-gray-300 text-sm">Durée: 10:20</p>
          </div>
        </div>
      </div>
    </div>
  )
}
