"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function EmailTestPanel() {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("Test Alert: Market Movement")
  const [message, setMessage] = useState("This is a test alert message.")
  const [alertType, setAlertType] = useState("price")
  const [includeDetails, setIncludeDetails] = useState(true)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus("error")
      setErrorMessage("Email is required")
      return
    }

    setStatus("loading")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate success
      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to send test email. Please try again.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Test Email Alert</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">Test email sent successfully to {email}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertType">Alert Type</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger id="alertType">
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price Movement</SelectItem>
                <SelectItem value="volume">Volume Spike</SelectItem>
                <SelectItem value="news">News Alert</SelectItem>
                <SelectItem value="earnings">Earnings Report</SelectItem>
                <SelectItem value="sector">Sector Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={includeDetails}
              onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
            />
            <Label htmlFor="includeDetails" className="cursor-pointer">
              Include detailed market data
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
