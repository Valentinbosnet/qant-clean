import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarLoadingProps {
  className?: string
}

export default function SidebarLoading({ className }: SidebarLoadingProps) {
  return (
    <div className={cn("flex h-full w-60 flex-col bg-gray-800 text-white items-center justify-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      <p className="text-sm text-gray-400 mt-2">Chargement...</p>
    </div>
  )
}
