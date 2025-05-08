"use client"

import { RealtimePresence } from "@/components/realtime/realtime-presence"

export default function RealtimePage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Fonctionnalités en temps réel</h1>
      <RealtimePresence />
    </div>
  )
}
