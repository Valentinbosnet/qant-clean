/**
 * Utilitaires de compression pour réduire la taille des données en cache
 */

// Fonction de compression LZW (Lempel-Ziv-Welch)
export function compressData(data: string): string {
  if (!data) return data

  const dict: Record<string, number> = {}
  const result: number[] = []
  let phrase = ""
  let code = 256

  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i
  }

  for (let i = 0; i < data.length; i++) {
    const current = data.charAt(i)
    const combined = phrase + current

    if (dict[combined] !== undefined) {
      phrase = combined
    } else {
      result.push(dict[phrase])
      dict[combined] = code++
      phrase = current
    }
  }

  if (phrase !== "") {
    result.push(dict[phrase])
  }

  // Convertir en base64 pour un stockage plus efficace
  return btoa(result.map((code) => String.fromCharCode(code)).join(""))
}

// Fonction de décompression LZW
export function decompressData(compressedData: string): string {
  if (!compressedData) return compressedData

  try {
    // Convertir depuis base64
    const data = atob(compressedData)
    const codes: number[] = []

    for (let i = 0; i < data.length; i++) {
      codes.push(data.charCodeAt(i))
    }

    const dict: Record<number, string> = {}
    let phrase = String.fromCharCode(codes[0])
    let result = phrase
    let code = 256

    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i)
    }

    for (let i = 1; i < codes.length; i++) {
      const currentCode = codes[i]
      let entry: string

      if (dict[currentCode] !== undefined) {
        entry = dict[currentCode]
      } else if (currentCode === code) {
        entry = phrase + phrase.charAt(0)
      } else {
        throw new Error("Erreur de décompression: code invalide")
      }

      result += entry
      dict[code++] = phrase + entry.charAt(0)
      phrase = entry
    }

    return result
  } catch (error) {
    console.error("Erreur lors de la décompression des données:", error)
    return ""
  }
}

// Compression JSON optimisée
export function compressJSON<T>(data: T): string {
  try {
    const jsonString = JSON.stringify(data)
    return compressData(jsonString)
  } catch (error) {
    console.error("Erreur lors de la compression JSON:", error)
    return JSON.stringify(data)
  }
}

// Décompression JSON optimisée
export function decompressJSON<T>(compressedData: string): T | null {
  try {
    const jsonString = decompressData(compressedData)
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error("Erreur lors de la décompression JSON:", error)
    return null
  }
}

// Fonction pour estimer le taux de compression
export function estimateCompressionRatio(data: any): { original: number; compressed: number; ratio: number } {
  const jsonString = JSON.stringify(data)
  const compressed = compressData(jsonString)

  const originalSize = new Blob([jsonString]).size
  const compressedSize = new Blob([compressed]).size

  return {
    original: originalSize,
    compressed: compressedSize,
    ratio: originalSize / compressedSize,
  }
}

// Fonction pour compresser des données binaires (comme des images)
export function compressBinaryData(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return compressData(binary)
}

// Fonction pour décompresser des données binaires
export function decompressBinaryData(compressedData: string): ArrayBuffer {
  const binary = decompressData(compressedData)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
