"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function DebugVerifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { data: session, update } = useSession()

  const bypassVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/bypass-verification", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)

      if (response.ok) {
        await update()
      }
    } catch (error) {
      setResult({ error: "Erreur lors de la requête" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Débogage de la vérification d'email</h1>

      <div className="mb-4 rounded-lg bg-yellow-50 p-4">
        <p className="text-yellow-800">Cette page est uniquement disponible en mode développement.</p>
      </div>

      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">Session actuelle</h2>
        <pre className="whitespace-pre-wrap rounded bg-gray-100 p-2">{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">Actions</h2>
        <button
          onClick={bypassVerification}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "En cours..." : "Bypass de vérification d'email"}
        </button>
      </div>

      {result && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 text-xl font-semibold">Résultat</h2>
          <pre className="whitespace-pre-wrap rounded bg-gray-100 p-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
