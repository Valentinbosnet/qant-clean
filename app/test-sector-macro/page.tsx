"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectorMacroeconomicIndicators } from "@/components/sector-macroeconomic-indicators"
import { SectorAwarePrediction } from "@/components/sector-aware-prediction"
import type { SectorType } from "@/lib/sector-classification"

export default function TestSectorMacroPage() {
  const [sector, setSector] = useState<SectorType>("technology")
  const [symbol, setSymbol] = useState("AAPL")
  const [inputSymbol, setInputSymbol] = useState("AAPL")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSymbol(inputSymbol.toUpperCase())
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Analyse Macroéconomique Sectorielle</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sélection du secteur et du symbole</CardTitle>
          <CardDescription>
            Choisissez un secteur et un symbole boursier pour analyser les indicateurs macroéconomiques spécifiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur</Label>
                <Select value={sector} onValueChange={(value) => setSector(value as SectorType)}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technologie</SelectItem>
                    <SelectItem value="healthcare">Santé</SelectItem>
                    <SelectItem value="financial">Finance</SelectItem>
                    <SelectItem value="consumer">Consommation</SelectItem>
                    <SelectItem value="industrial">Industrie</SelectItem>
                    <SelectItem value="energy">Énergie</SelectItem>
                    <SelectItem value="utilities">Services publics</SelectItem>
                    <SelectItem value="materials">Matériaux</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="real_estate">Immobilier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Symbole boursier</Label>
                <div className="flex space-x-2">
                  <Input
                    id="symbol"
                    value={inputSymbol}
                    onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                    placeholder="ex: AAPL, MSFT, GOOGL"
                  />
                  <Button type="submit">Analyser</Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectorMacroeconomicIndicators sector={sector} symbol={symbol} />
        <SectorAwarePrediction defaultSymbol={symbol} />
      </div>
    </div>
  )
}
