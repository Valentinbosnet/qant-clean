"use client"

import { useState, useEffect, useCallback } from "react"
import { notesService, type Note, type NewNote } from "@/lib/notes-service"
import { useToast } from "@/components/ui/use-toast"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Charger les notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await notesService.getNotes()
      setNotes(data)
    } catch (error) {
      console.error("Erreur lors du chargement des notes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Créer une note
  const createNote = useCallback(
    async (note: NewNote) => {
      try {
        const newNote = await notesService.createNote(note)
        setNotes((prev) => [newNote, ...prev])
        toast({
          title: "Note créée",
          description: "Votre note a été créée avec succès",
        })
        return newNote
      } catch (error) {
        console.error("Erreur lors de la création de la note:", error)
        toast({
          title: "Erreur",
          description: "Impossible de créer la note",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast],
  )

  // Mettre à jour une note
  const updateNote = useCallback(
    async (id: number, note: Partial<NewNote>) => {
      try {
        const updatedNote = await notesService.updateNote(id, note)
        setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)))
        toast({
          title: "Note mise à jour",
          description: "Votre note a été mise à jour avec succès",
        })
        return updatedNote
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la note:", error)
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la note",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast],
  )

  // Supprimer une note
  const deleteNote = useCallback(
    async (id: number) => {
      try {
        await notesService.deleteNote(id)
        setNotes((prev) => prev.filter((n) => n.id !== id))
        toast({
          title: "Note supprimée",
          description: "Votre note a été supprimée avec succès",
        })
      } catch (error) {
        console.error("Erreur lors de la suppression de la note:", error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la note",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast],
  )

  // Charger les notes au montage du composant
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // S'abonner aux changements de notes
  useEffect(() => {
    // Cette fonction ne doit être exécutée que côté client
    if (typeof window === "undefined") return

    const unsubscribe = notesService.subscribeToNotes((updatedNotes) => {
      setNotes(updatedNotes)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes: loadNotes,
  }
}
