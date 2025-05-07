"use client"

import { useState } from "react"
import { useNotes } from "@/hooks/use-notes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

export function NotesManager() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  // Gérer la création d'une nouvelle note
  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      await createNote({ title, content })
      setTitle("")
      setContent("")
      setIsCreating(false)
    } catch (error) {
      console.error("Erreur lors de la création de la note:", error)
    }
  }

  // Gérer la mise à jour d'une note
  const handleUpdateNote = async (id: number) => {
    if (!title.trim() || !content.trim()) return

    try {
      await updateNote(id, { title, content })
      setTitle("")
      setContent("")
      setIsEditing(null)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error)
    }
  }

  // Commencer l'édition d'une note
  const startEditing = (id: number, noteTitle: string, noteContent: string) => {
    setIsEditing(id)
    setTitle(noteTitle)
    setContent(noteContent)
    setIsCreating(false)
  }

  // Commencer la création d'une nouvelle note
  const startCreating = () => {
    setIsCreating(true)
    setIsEditing(null)
    setTitle("")
    setContent("")
  }

  // Annuler l'édition ou la création
  const cancelEdit = () => {
    setIsEditing(null)
    setIsCreating(false)
    setTitle("")
    setContent("")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bouton pour créer une nouvelle note */}
      {!isCreating && !isEditing && (
        <Button onClick={startCreating} className="mb-4">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle note
        </Button>
      )}

      {/* Formulaire de création/édition */}
      {(isCreating || isEditing !== null) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isCreating ? "Créer une nouvelle note" : "Modifier la note"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Titre
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Contenu
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu de la note"
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
            <Button onClick={() => (isEditing !== null ? handleUpdateNote(isEditing) : handleCreateNote())}>
              {isEditing !== null ? "Mettre à jour" : "Créer"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Liste des notes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{note.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="icon" onClick={() => startEditing(note.id, note.title, note.content)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Button>
              <Button variant="outline" size="icon" className="text-destructive" onClick={() => deleteNote(note.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Message si aucune note */}
      {notes.length === 0 && !isCreating && (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore de notes</p>
          <Button onClick={startCreating}>
            <Plus className="mr-2 h-4 w-4" /> Créer votre première note
          </Button>
        </div>
      )}
    </div>
  )
}
