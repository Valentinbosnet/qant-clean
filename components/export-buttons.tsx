"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import {
  exportBacktestResultToCSV,
  exportBacktestResultToPDF,
  exportComparisonToCSV,
  exportComparisonToPDF,
} from "@/lib/export-utils"
import type { RotationBacktestResult } from "@/lib/sector-rotation-backtest-service"

interface ExportButtonsProps {
  results: RotationBacktestResult[]
  isComparison?: boolean
}

export function ExportButtons({ results, isComparison = false }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "csv" | "pdf") => {
    if (results.length === 0) return

    setIsExporting(true)
    try {
      if (isComparison) {
        // Exporter la comparaison
        if (format === "csv") {
          exportComparisonToCSV(results)
        } else {
          exportComparisonToPDF(results)
        }
      } else {
        // Exporter un seul résultat
        const result = results[0]
        if (format === "csv") {
          exportBacktestResultToCSV(result, `backtest-${result.name.replace(/\s+/g, "-").toLowerCase()}`)
        } else {
          exportBacktestResultToPDF(result, `backtest-${result.name.replace(/\s+/g, "-").toLowerCase()}`)
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || results.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportation...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Exporter en CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exporter en PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
