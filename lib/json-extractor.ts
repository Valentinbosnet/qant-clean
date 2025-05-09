/**
 * Extrait le JSON d'une réponse potentiellement formatée en Markdown
 * @param text Texte à analyser
 * @returns JSON extrait ou le texte original si aucun bloc JSON n'est trouvé
 */
export function extractJsonFromMarkdown(text: string): string {
  // Rechercher un bloc JSON dans la réponse Markdown
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    console.log("JSON extrait du bloc Markdown")
    return match[1]
  }

  // Vérifier si le texte commence directement par {
  if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
    console.log("Le texte est déjà au format JSON")
    return text
  }

  // Si aucun bloc JSON n'est trouvé, essayer d'extraire tout ce qui ressemble à du JSON
  const anyJsonRegex = /(\{[\s\S]*?\})/
  const anyMatch = text.match(anyJsonRegex)

  if (anyMatch && anyMatch[1]) {
    console.log("JSON extrait du texte (méthode alternative)")
    return anyMatch[1]
  }

  console.log("Aucun JSON trouvé dans la réponse, retour du texte original")
  console.log("Premiers 100 caractères de la réponse:", text.substring(0, 100))
  return text
}
