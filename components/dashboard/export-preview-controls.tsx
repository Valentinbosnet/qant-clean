"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, ImageIcon, FileText, Copy, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

import "@/styles/export-preview.css"

export interface ExportOptions {
  format: "png" | "jpeg" | "pdf"
  includeTitle: boolean
  includeBorder: boolean
  highQuality: boolean
  fileName: string
}

interface ExportPreviewControlsProps {
  previewRef: React.RefObject<HTMLDivElement>
  templateName: string
  options: ExportOptions
  onOptionsChange: (options: ExportOptions) => void
}

export function ExportPreviewControls({
  previewRef,
  templateName,
  options,
  onOptionsChange,
}: ExportPreviewControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleFormatChange = (format: "png" | "jpeg" | "pdf") => {
    onOptionsChange({
      ...options,
      format,
    })
  }

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      fileName: e.target.value,
    })
  }

  const handleToggleIncludeTitle = () => {
    onOptionsChange({
      ...options,
      includeTitle: !options.includeTitle,
    })
  }

  const handleToggleIncludeBorder = () => {
    onOptionsChange({
      ...options,
      includeBorder: !options.includeBorder,
    })
  }

  const handleToggleHighQuality = () => {
    onOptionsChange({
      ...options,
      highQuality: !options.highQuality,
    })
  }

  const exportPreview = async () => {
    if (!previewRef.current) return

    setIsExporting(true)
    try {
      // Trouver l'élément de prévisualisation à exporter
      const previewElement = previewRef.current.querySelector(".preview-container") || previewRef.current

      // Configurer les options html2canvas
      const scale = options.highQuality ? 2 : 1
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: options.includeBorder ? "#ffffff" : null,
      })

      // Exporter selon le format choisi
      if (options.format === "pdf") {
        const imgData = canvas.toDataURL("image/jpeg", 0.95)
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width / scale, canvas.height / scale],
        })

        if (options.includeTitle) {
          pdf.setFontSize(16)
          pdf.text(templateName, 20, 20)
          pdf.addImage(imgData, "JPEG", 0, 30, canvas.width / scale, canvas.height / scale)
        } else {
          pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / scale, canvas.height / scale)
        }

        pdf.save(`${options.fileName || "dashboard-preview"}.pdf`)
      } else {
        const imgType = options.format === "png" ? "image/png" : "image/jpeg"
        const quality = options.format === "png" ? 1 : 0.95
        const dataUrl = canvas.toDataURL(imgType, quality)

        const link = document.createElement("a")
        link.download = `${options.fileName || "dashboard-preview"}.${options.format}`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error)
      alert("Une erreur est survenue lors de l'exportation. Veuillez réessayer.")
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const copyToClipboard = async () => {
    if (!previewRef.current) return

    setIsExporting(true)
    try {
      const previewElement = previewRef.current.querySelector(".preview-container") || previewRef.current
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ])
            alert("Image copiée dans le presse-papiers")
          } catch (err) {
            console.error("Erreur lors de la copie dans le presse-papiers:", err)
            alert("Impossible de copier l'image. Votre navigateur ne supporte peut-être pas cette fonctionnalité.")
          }
        }
        setIsExporting(false)
        setIsOpen(false)
      })
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Exporter la prévisualisation</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Exporter la prévisualisation</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2 space-y-4">
            <div>
              <Label className="mb-2 block">Format</Label>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant={options.format === "png" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${options.format === "png" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => handleFormatChange("png")}
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  PNG
                </Button>
                <Button
                  variant={options.format === "jpeg" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${options.format === "jpeg" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => handleFormatChange("jpeg")}
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  JPEG
                </Button>
                <Button
                  variant={options.format === "pdf" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${options.format === "pdf" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => handleFormatChange("pdf")}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="file-name" className="mb-2 block">
                Nom du fichier
              </Label>
              <Input
                id="file-name"
                value={options.fileName}
                onChange={handleFileNameChange}
                placeholder="dashboard-preview"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-title"
                  checked={options.includeTitle}
                  onCheckedChange={handleToggleIncludeTitle}
                />
                <Label htmlFor="include-title" className="cursor-pointer">
                  Inclure le titre
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-border"
                  checked={options.includeBorder}
                  onCheckedChange={handleToggleIncludeBorder}
                />
                <Label htmlFor="include-border" className="cursor-pointer">
                  Inclure une bordure
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="high-quality" checked={options.highQuality} onCheckedChange={handleToggleHighQuality} />
                <Label htmlFor="high-quality" className="cursor-pointer">
                  Haute qualité
                </Label>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="p-2 space-y-2">
            <Button className="w-full" onClick={exportPreview} disabled={isExporting} variant="default" size="sm">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportation...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </>
              )}
            </Button>

            <Button className="w-full" onClick={copyToClipboard} disabled={isExporting} variant="outline" size="sm">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Copie...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier dans le presse-papiers
                </>
              )}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
