"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function DebugInfo() {
  const [isOpen, setIsOpen] = useState(false)
  const [info, setInfo] = useState<any>(null)

  const collectDebugInfo = () => {
    // Collecter des informations de débogage
    const debugInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      url: window.location.href,
      cssLoaded: document.styleSheets.length,
      environment: process.env.NODE_ENV,
      nextPublicEnv: Object.keys(process.env)
        .filter((key) => key.startsWith("NEXT_PUBLIC_"))
        .reduce(
          (obj, key) => {
            obj[key] = process.env[key]
            return obj
          },
          {} as Record<string, any>,
        ),
      localStorage: {
        available: (() => {
          try {
            return typeof window !== "undefined" && !!window.localStorage
          } catch (e) {
            return false
          }
        })(),
        keys: (() => {
          try {
            return Object.keys(localStorage)
          } catch (e) {
            return []
          }
        })(),
      },
      documentReady: document.readyState,
      tailwindLoaded: !!document.querySelector("[data-tw-rendered]"),
    }

    setInfo(debugInfo)
    setIsOpen(true)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={collectDebugInfo}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
          >
            Debug
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Informations de débogage</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {info ? JSON.stringify(info, null, 2) : "Chargement..."}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
