"use client"

import { NotesManager } from "@/components/notes/notes-manager"

export default function NotesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Gestionnaire de Notes</h1>
      <NotesManager />
    </div>
  )
}
