import nodemailer from "nodemailer"
import { getConfig } from "./env-config"

// Configuration pour l'envoi d'emails
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

// Interface pour les options d'email
export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null
  private initialized = false
  private initializationError: Error | null = null

  constructor() {
    this.initialize()
  }

  // Initialiser le service d'email
  private async initialize() {
    try {
      const config = getConfig()

      // Vérifier si les variables d'environnement nécessaires sont définies
      if (
        !config.EMAIL_SERVER_HOST ||
        !config.EMAIL_SERVER_PORT ||
        !config.EMAIL_SERVER_USER ||
        !config.EMAIL_SERVER_PASSWORD ||
        !config.EMAIL_FROM
      ) {
        throw new Error("Missing email configuration environment variables")
      }

      this.config = {
        host: config.EMAIL_SERVER_HOST,
        port: Number.parseInt(config.EMAIL_SERVER_PORT),
        secure: config.EMAIL_SERVER_SECURE === "true",
        auth: {
          user: config.EMAIL_SERVER_USER,
          pass: config.EMAIL_SERVER_PASSWORD,
        },
        from: config.EMAIL_FROM,
      }

      // Créer le transporteur nodemailer
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      })

      // Vérifier la connexion
      await this.transporter.verify()
      this.initialized = true
      console.log("Email service initialized successfully")
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error(String(error))
      console.error("Failed to initialize email service:", this.initializationError)
    }
  }

  // Vérifier si le service est prêt
  public isReady(): boolean {
    return this.initialized && this.transporter !== null
  }

  // Obtenir l'erreur d'initialisation
  public getInitializationError(): Error | null {
    return this.initializationError
  }

  // Envoyer un email
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isReady()) {
      if (!this.initialized) {
        // Tenter de réinitialiser si ce n'est pas encore fait
        await this.initialize()
        if (!this.isReady()) {
          throw new Error("Email service is not initialized: " + this.initializationError?.message)
        }
      } else {
        throw new Error("Email service is not initialized: " + this.initializationError?.message)
      }
    }

    try {
      const mailOptions = {
        from: this.config!.from,
        ...options,
      }

      const info = await this.transporter!.sendMail(mailOptions)
      console.log("Email sent successfully:", info.messageId)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  // Envoyer un email de test
  public async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: "Test Email from Stock Prediction App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from the Stock Prediction App.</p>
          <p>If you received this email, it means that the email service is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `,
    })
  }
}

// Exporter une instance du service
export const emailService = new EmailService()
