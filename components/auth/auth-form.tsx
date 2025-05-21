"use client"

import type React from "react"
import { useState } from "react"

interface AuthFormProps {
  isLogin: boolean
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault()

    // Placeholder for authentication logic
    console.log("Submitting...", email, password)

    // Example of offline authentication (replace with actual implementation)
    // Assuming authenticateOfflineUser is defined in "@/lib/offline-auth" or "@/lib/prefetch-service"
    // and handles authentication logic when the user is offline.
    try {
      const { authenticateOfflineUser } = await import("@/lib/offline-auth") // Or "@/lib/prefetch-service"
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
    <form onSubmit={submitHandler}>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">{isLogin ? "Login" : "Create Account"}</button>
    </form>
  )
}

export default AuthForm
