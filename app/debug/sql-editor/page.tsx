"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function SqlEditorPage() {
  const [sql, setSql] = useState<string>(`-- Création de la table verification_tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Création de la table email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error TEXT
);

-- Création des index
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);`)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const executeSQL = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message || "Une erreur s'est produite" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Éditeur SQL</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Cette page vous permet d&apos;exécuter des requêtes SQL directement sur votre base de données Supabase.
            <strong className="text-red-600"> Attention : </strong> Cette fonctionnalité est destinée uniquement au
            développement.
          </p>

          <div className="mb-4">
            <Textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="font-mono h-80"
              placeholder="Entrez votre requête SQL ici..."
            />
          </div>

          <Button onClick={executeSQL} disabled={loading}>
            {loading ? "Exécution..." : "Exécuter SQL"}
          </Button>

          {result && (
            <div
              className={`mt-4 p-4 rounded ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              <pre className="whitespace-pre-wrap">{result.success ? result.message : result.error}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
