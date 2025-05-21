"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authenticateOfflineUser } from "@/lib/offline-auth"
import type React from "react"

export interface DirectAuthFormProps {
  defaultTab?: "signin" | "signup"
  onSuccess?: () => void
}

export function DirectAuthForm({ defaultTab = "signin", onSuccess = () => {} }: DirectAuthFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const success = await authenticateOfflineUser(username, password)

      if (success) {
        onSuccess()
        router.push("/dashboard")
      } else {
        setError("Invalid username or password.")
      }
    } catch (err: any) {
      setError("An error occurred during authentication.")
      console.error(err)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("signin")}
          className={`px-4 py-2 ${activeTab === "signin" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`px-4 py-2 ${activeTab === "signup" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"}`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            {activeTab === "signin" ? "Username or Email" : "Choose a Username"}
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {activeTab === "signin" ? "Password" : "Create Password"}
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded" type="submit">
          {activeTab === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  )
}

// Default export for backwards compatibility
export default DirectAuthForm
