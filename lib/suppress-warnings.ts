// Ce fichier supprime les avertissements de dépréciation de punycode
// Il doit être importé au début de l'application

// Supprimer l'avertissement de dépréciation de punycode
const originalEmit = process.emit
process.emit = (name, data, ...args) => {
  if (
    name === "warning" &&
    typeof data === "object" &&
    data.name === "DeprecationWarning" &&
    data.message.includes("punycode")
  ) {
    return false
  }
  return originalEmit.call(process, name, data, ...args)
}

export {}
