"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { authenticateOfflineUser } from "@/lib/prefetch-service" // Or "@/lib/offline-auth"

const AuthDebugPanel = () => {
  const { data: session, status } = useSession()
  const [offlineUser, setOfflineUser] = useState<any>(null)

  useEffect(() => {
    const fetchOfflineUser = async () => {
      try {
        const user = await authenticateOfflineUser()
        setOfflineUser(user)
      } catch (error) {
        console.error("Error fetching offline user:", error)
        setOfflineUser(null)
      }
    }

    fetchOfflineUser()
  }, [])

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>Authentication Debug Panel</h3>

      <h4>Session Status: {status}</h4>

      {status === "loading" && <p>Loading session...</p>}

      {status === "authenticated" && (
        <>
          <h5>Session Data:</h5>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      )}

      {status === "unauthenticated" && <p>Not signed in.</p>}

      <h4>Offline User (Prefetch Service):</h4>
      {offlineUser ? (
        <pre>{JSON.stringify(offlineUser, null, 2)}</pre>
      ) : (
        <p>No offline user found or error fetching.</p>
      )}
    </div>
  )
}

export default AuthDebugPanel
