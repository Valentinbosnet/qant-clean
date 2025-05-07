"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Custom404() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page d'accueil après 3 secondes
    const redirectTimer = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(redirectTimer)
  }, [router])

  return (
    <div className="container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        You will be redirected to the{" "}
        <Link href="/">
          <a>home page</a>
        </Link>{" "}
        in 3 seconds...
      </p>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 0 20px;
        }
        
        h1 {
          margin-bottom: 20px;
        }
        
        a {
          color: #0070f3;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
