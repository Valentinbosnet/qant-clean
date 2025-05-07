"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { SearchDialog } from "@/components/search/search-dialog"

interface SearchButtonProps {
  onAddStock: (symbol: string) => void
}

export function SearchButton({ onAddStock }: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setIsSearchOpen(true)} className="gap-2">
        <Search className="h-4 w-4" />
        <span>Search Stocks</span>
      </Button>
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddStock={(symbol) => {
          onAddStock(symbol)
          setIsSearchOpen(false)
        }}
      />
    </>
  )
}
