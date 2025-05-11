"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Zap, Brain, Wrench, Bug } from "lucide-react"

export function DiagnosticNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const diagnosticPages = [
    { name: "Test des prédictions", path: "/test-predictions", icon: <Zap className="mr-2 h-4 w-4" /> },
    { name: "Diagnostic IA+", path: "/diagnostics/predictions", icon: <Brain className="mr-2 h-4 w-4" /> },
    { name: "Outils de débogage", path: "/debug/openai", icon: <Wrench className="mr-2 h-4 w-4" /> },
    { name: "Statut des API", path: "/settings/api/debug", icon: <Bug className="mr-2 h-4 w-4" /> },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          Diagnostics
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {diagnosticPages.map((page) => (
          <DropdownMenuItem key={page.path} asChild>
            <Link href={page.path} className="flex items-center cursor-pointer" onClick={() => setOpen(false)}>
              {page.icon}
              {page.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
