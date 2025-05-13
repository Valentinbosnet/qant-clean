// Types pour la configuration du service d'email
interface EmailConfig {
  service: string
  host?: string
  port?: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
  sender: string
}

// Types pour les destinataires d'email
interface EmailRecipient {
  email: string
  name?: string
}

// Types pour les pièces jointes
interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
}

// Types pour un email
interface Email {
  to: EmailRecipient | EmailRecipient[]
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
}

class EmailService {
  private config: EmailConfig | null = null
  private isInitialized = false
  private mockMode = false

  constructor() {
    this.initialize()
  }

  initialize() {
    try {
      // Vérifier si les variables d'environnement nécessaires sont définies
      const emailService = process.env.EMAIL_SERVICE
      const emailUser = process.env.EMAIL_SERVER_USER || process.env.MAILJET_API_KEY
      const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.MAILJET_SECRET_KEY
      const emailSender = process.env.EMAIL_FROM || process.env.MAILJET_SENDER

      if (!emailService || !emailUser || !emailPass || !emailSender) {
        console.warn("Email service not configured. Using mock mode.")
        this.mockMode = true
        this.isInitialized = true
        return
      }

      // Configuration de base
      this.config = {
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        sender: emailSender,
      }

      // Configuration spécifique pour SMTP
      if (emailService === "smtp" && process.env.EMAIL_SERVER_HOST) {
        this.config.host = process.env.EMAIL_SERVER_HOST
        this.config.port = process.env.EMAIL_SERVER_PORT ? Number.parseInt(process.env.EMAIL_SERVER_PORT) : 587
        this.config.secure = process.env.EMAIL_SERVER_SECURE === "true"
      }

      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize email service:", error)
      this.mockMode = true
      this.isInitialized = true
    }
  }

  async sendEmail(email: Email): Promise<boolean> {
    if (!this.isInitialized) {
      this.initialize()
    }

    if (this.mockMode) {
      console.log("MOCK EMAIL:", {
        to: email.to,
        subject: email.subject,
        textLength: email.text?.length || 0,
        htmlLength: email.html?.length || 0,
      })
      return true
    }

    try {
      // Ici, nous utiliserions normalement une bibliothèque comme nodemailer ou l'API Mailjet
      // Pour l'instant, nous simulons simplement l'envoi
      console.log("Email would be sent with config:", this.config)
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to: { email: to },
      subject: "Test Email from Stock App",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the Stock App.</p>
        <p>If you received this email, the email service is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `,
    })
  }
}

// Exporter une instance singleton
export const emailService = new EmailService()
