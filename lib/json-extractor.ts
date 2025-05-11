/**
 * Fonction améliorée pour extraire le JSON d'une réponse Markdown
 * Gère plusieurs cas d'extraction et formats différents
 */
export function extractJsonFromMarkdown(text: string): string {
  if (!text) return "{}"

  console.log("Extracting JSON from text of length:", text.length)

  // Cas 1: Si le texte est déjà un JSON valide, le retourner directement
  try {
    JSON.parse(text)
    console.log("Text is already valid JSON")
    return text
  } catch (e) {
    // Continuer avec d'autres méthodes d'extraction
  }

  // Cas 2: Rechercher le bloc de code JSON standard
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/
  const jsonBlockMatch = text.match(jsonBlockRegex)

  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      const extracted = jsonBlockMatch[1].trim()
      // Vérifier si c'est un JSON valide
      JSON.parse(extracted)
      console.log("Extracted JSON from code block")
      return extracted
    } catch (e) {
      console.log("Extracted code block is not valid JSON")
    }
  }

  // Cas 3: Rechercher un objet JSON complet
  const jsonObjectRegex = /(\{[\s\S]*\})/
  const jsonObjectMatch = text.match(jsonObjectRegex)

  if (jsonObjectMatch && jsonObjectMatch[1]) {
    try {
      const extracted = jsonObjectMatch[1].trim()
      // Vérifier si c'est un JSON valide
      JSON.parse(extracted)
      console.log("Extracted JSON object")
      return extracted
    } catch (e) {
      console.log("Extracted object is not valid JSON")
    }
  }

  // Cas 4: Extraction avancée avec recherche de début et fin d'accolades
  try {
    const startIndex = text.indexOf("{")
    const endIndex = text.lastIndexOf("}")

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const extracted = text.substring(startIndex, endIndex + 1)
      // Vérifier si c'est un JSON valide
      JSON.parse(extracted)
      console.log("Extracted JSON with custom bounds")
      return extracted
    }
  } catch (e) {
    console.log("Custom extraction failed")
  }

  // Cas 5: Tentative de nettoyage et extraction
  try {
    // Supprimer les lignes qui ne commencent pas par des éléments JSON valides
    const cleanedLines = text
      .split("\n")
      .filter((line) => /^\s*["{[\d]/.test(line) || /^\s*\}/.test(line))
      .join("\n")

    if (cleanedLines) {
      const startIndex = cleanedLines.indexOf("{")
      const endIndex = cleanedLines.lastIndexOf("}")

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const extracted = cleanedLines.substring(startIndex, endIndex + 1)
        // Vérifier si c'est un JSON valide
        JSON.parse(extracted)
        console.log("Extracted JSON after cleaning")
        return extracted
      }
    }
  } catch (e) {
    console.log("Cleaned extraction failed")
  }

  // Si toutes les tentatives échouent, renvoyer un JSON vide
  console.warn("All JSON extraction methods failed, returning empty object")
  return "{}"
}
