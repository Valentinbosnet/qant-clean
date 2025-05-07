"use client"

import { useState, useEffect } from "react"
import { useNotesClient } from "@/lib/notes-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/lib/notes-service"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const notesClient = useNotesClient()

  // Charger les notes
  const loadNotes = async () => {
    if (!user) {
      setNotes([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await notesClient.getNotes()
      setNotes(data)
    } catch (error: any) {
      console.error("Erreur lors du chargement des notes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos notes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Ajouter une note
  const addNote = async (title: string, content: string) => {
    if (!user) return null

    try {
      const note = await notesClient.createNote(title, content)
      toast({
        title: "Note ajoutée",
        description: "Votre note a été ajoutée avec succès",
      })
      await loadNotes()
      return note
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la note:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre note",
        variant: "destructive",
      })
      return null
    }
  }

  // Mettre à jour une note
  const updateNote = async (id: number, title: string, content: string) => {
    if (!user) return false

    try {
      await notesClient.updateNote(id, { title, content })
      toast({
        title: "Note mise à jour",
        description: "Votre note a été mise à jour avec succès",
      })
      await loadNotes()
      return true
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la note:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre note",
        variant: "destructive",
      })
      return false
    }
  }

  // Supprimer une note
  const deleteNote = async (id: number) => {
    if (!user) return false

    try {
      await notesClient.deleteNote(id)
      toast({
        title: "Note supprimée",
        description: "Votre note a été supprimée avec succès",
      })
      await loadNotes()
      return true
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la note:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre note",
        variant: "destructive",
      })
      return false
    }
  }

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!user) return

    const unsubscribe = notesClient.subscribeToNotes((updatedNotes) => {
      setNotes(updatedNotes)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  // Charger les notes au montage et quand l'utilisateur change
  useEffect(() => {
    loadNotes()
  }, [user])

  return {
    notes,
    isLoading,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
  }
}
