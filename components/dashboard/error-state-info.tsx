import { AlertCircle, Ban, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ErrorStateType } from "./error-state-controls"

import "@/styles/error-info.css"

interface ErrorStateInfoProps {
  type: ErrorStateType
}

export function ErrorStateInfo({ type }: ErrorStateInfoProps) {
  if (type === "none") return null

  const getInfo = () => {
    switch (type) {
      case "no-data":
        return {
          icon: <Ban className="h-4 w-4" />,
          title: "Absence de données",
          description:
            "Cette prévisualisation montre comment le tableau de bord gère les situations où aucune donnée n'est disponible. Un bon design doit fournir des messages clairs et des actions alternatives pour guider l'utilisateur.",
          bestPractices: [
            "Afficher un message explicatif clair",
            "Proposer des actions alternatives (rafraîchir, configurer, etc.)",
            "Éviter les espaces vides sans explication",
            "Maintenir la structure de la page pour éviter les sauts de mise en page",
          ],
        }
      case "loading-error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Erreur de chargement",
          description:
            "Cette prévisualisation simule des erreurs lors du chargement des données. Un tableau de bord robuste doit gérer ces erreurs avec élégance et offrir des moyens de récupération.",
          bestPractices: [
            "Indiquer clairement la nature de l'erreur",
            "Offrir un bouton pour réessayer",
            "Conserver les données précédemment chargées si possible",
            "Proposer un moyen de signaler le problème",
          ],
        }
      case "network-offline":
        return {
          icon: <WifiOff className="h-4 w-4" />,
          title: "Déconnexion réseau",
          description:
            "Cette prévisualisation montre comment le tableau de bord se comporte lorsque l'utilisateur est hors ligne. Une bonne expérience utilisateur doit permettre un fonctionnement dégradé même sans connexion.",
          bestPractices: [
            "Afficher une notification claire sur l'état de la connexion",
            "Permettre la consultation des données mises en cache",
            "Mettre en file d'attente les actions pour synchronisation ultérieure",
            "Tenter de se reconnecter automatiquement",
          ],
        }
      default:
        return null
    }
  }

  const info = getInfo()
  if (!info) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {info.icon} {info.title}
      </AlertTitle>
      <AlertDescription>
        <p className="mt-2">{info.description}</p>
        <div className="mt-4">
          <p className="font-semibold">Bonnes pratiques:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {info.bestPractices.map((practice, index) => (
              <li key={index}>{practice}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}
