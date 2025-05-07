const fs = require("fs")
const path = require("path")

// Vérifier que les fichiers CSS sont générés
const cssDir = path.join(process.cwd(), ".next/static/css")

try {
  if (fs.existsSync(cssDir)) {
    const files = fs.readdirSync(cssDir)
    console.log("Fichiers CSS générés:", files)

    if (files.length === 0) {
      console.warn("ATTENTION: Aucun fichier CSS n'a été généré!")
    }
  } else {
    console.warn("ATTENTION: Le répertoire CSS n'existe pas!")
  }
} catch (err) {
  console.error("Erreur lors de la vérification des fichiers CSS:", err)
}
