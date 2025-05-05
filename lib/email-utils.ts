// Assurons-nous que cette fonction existe pour générer un code de vérification
export function generateVerificationCode(): string {
  // Générer un code à 6 chiffres
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Fonction pour générer le HTML de l'email de vérification
export function generateVerificationEmailHtml(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vérification de votre adresse email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .code { font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background-color: #e5e7eb; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vérification de votre adresse email</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
          <div class="code">${code}</div>
          <p>Ce code est valable pendant 24 heures.</p>
          <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
