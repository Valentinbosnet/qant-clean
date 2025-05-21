"use client"

import { useState } from "react"
import type React from "react"

export interface AuthFormProps {
  defaultTab?: "signin" | "signup"
  isLogin?: boolean
}

export function AuthForm({ defaultTab = "signin", isLogin = true }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab)

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault()

    // Placeholder for authentication logic
    console.log("Submitting...", email, password, activeTab)

    // Example of offline authentication
    try {
      const { authenticateOfflineUser } = await import("@/lib/offline-auth")
      const isAuthenticated = await authenticateOfflineUser(email, password)

      if (isAuthenticated) {
        console.log("User authenticated offline")
      } else {
        console.log("Offline authentication failed")
      }
    } catch (error) {
      console.error("Error during offline authentication:", error)
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

      <form onSubmit={submitHandler} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
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
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {activeTab === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  )
}

// Default export for backwards compatibility
export default AuthForm
