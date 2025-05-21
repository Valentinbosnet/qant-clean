import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { AccessibilityMode } from "./accessibility-controls"

// If there are any CSS imports using relative paths, update them to use the "@/" alias
// For example, if there's something like:
// import "../styles/accessibility.css"
// Change it to:
import "@/styles/accessibility.css"

interface AccessibilityInfoProps {
  mode: AccessibilityMode
}

export function AccessibilityInfo({ mode }: AccessibilityInfoProps) {
  if (mode === "none") return null

  const getTitle = () => {
    switch (mode) {
      case "protanopia":
        return "Protanopie (déficience de perception du rouge)"
      case "deuteranopia":
        return "Deutéranopie (déficience de perception du vert)"
      case "tritanopia":
        return "Tritanopie (déficience de perception du bleu)"
      case "high-contrast":
        return "Mode contraste élevé"
      case "large-text":
        return "Mode texte agrandi"
      case "reduced-motion":
        return "Mode réduction des animations"
      default:
        return "Mode d'accessibilité"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "protanopia":
        return "La protanopie est une forme de daltonisme où la personne a une déficience dans la perception des couleurs rouges. Environ 1% des hommes sont concernés."
      case "deuteranopia":
        return "La deutéranopie est une forme de daltonisme où la personne a une déficience dans la perception des couleurs vertes. C'est la forme la plus courante, touchant environ 6% des hommes."
      case "tritanopia":
        return "La tritanopie est une forme rare de daltonisme où la personne a une déficience dans la perception des couleurs bleues. Elle touche moins de 0,1% de la population."
      case "high-contrast":
        return "Le mode contraste élevé améliore la lisibilité pour les personnes ayant une déficience visuelle ou qui travaillent dans des environnements très lumineux ou sombres."
      case "large-text":
        return "Le texte agrandi améliore la lisibilité pour les personnes ayant une déficience visuelle ou qui préfèrent simplement un texte plus grand."
      case "reduced-motion":
        return "La réduction des animations aide les personnes sensibles au mouvement ou souffrant de troubles vestibulaires, comme le vertige ou les migraines déclenchées par le mouvement."
      default:
        return "Ce mode simule l'expérience des utilisateurs ayant des besoins d'accessibilité spécifiques."
    }
  }

  const getRecommendations = () => {
    switch (mode) {
      case "protanopia":
      case "deuteranopia":
      case "tritanopia":
        return [
          "Évitez de transmettre des informations uniquement par la couleur",
          "Utilisez des motifs, des formes ou des étiquettes en plus des couleurs",
          "Assurez un contraste suffisant entre les éléments",
          "Utilisez des combinaisons de couleurs sûres pour le daltonisme (bleu/jaune, noir/blanc)",
        ]
      case "high-contrast":
        return [
          "Assurez-vous que tous les textes ont un rapport de contraste d'au moins 4,5:1",
          "Évitez les arrière-plans avec motifs ou textures",
          "Utilisez des bordures distinctes pour séparer les éléments",
          "Évitez les textes sur des images sans overlay suffisant",
        ]
      case "large-text":
        return [
          "Concevez une mise en page flexible qui s'adapte à différentes tailles de texte",
          "Évitez de tronquer le texte ou d'utiliser des ellipses",
          "Assurez-vous que les boutons et zones cliquables sont suffisamment grands",
          "Testez votre interface avec différentes tailles de texte",
        ]
      case "reduced-motion":
        return [
          "Limitez ou éliminez les animations non essentielles",
          "Offrez des alternatives statiques aux contenus animés",
          "Permettez aux utilisateurs de contrôler la vitesse des animations",
          "Respectez la préférence 'prefers-reduced-motion' du système",
        ]
      default:
        return []
    }
  }

  return (
    <Alert variant="info" className="mt-4">
      <Info className="h-4 w-4" />
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription>
        <p className="mt-2 mb-4">{getDescription()}</p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="recommendations">
            <AccordionTrigger>Recommandations pour les développeurs</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {getRecommendations().map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AlertDescription>
    </Alert>
  )
}
