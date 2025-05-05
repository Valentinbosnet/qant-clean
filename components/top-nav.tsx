"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell } from "lucide-react"
import { usePathname } from "next/navigation"

export default function TopNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user

  if (!session) return null

  return (
    <div className="h-16 border-b border-gray-700 bg-gray-800 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-white">TradeAssist</h1>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-gray-300 hidden md:inline-block">
            {session.user.name || session.user.email}
          </span>
        </div>

        <Link href="/logout">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
