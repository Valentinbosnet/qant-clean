"use client"

import type React from "react"

import { useState } from "react"
import { useNotes } from "@/hooks/use-notes"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Edit, Trash, Save, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function NotesManager() {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useNotes()
  const { user } = useAuth()
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setIsSubmitting(true)
    await addNote(newTitle, newContent)
    setNewTitle("")
    setNewContent("")
    setIsAdding(false)
    setIsSubmitting(false)
  }

  const handleUpdateNote = async (id: number) => {
    if (!editTitle.trim() || !editContent.trim()) return

    setIsSubmitting(true)
    await updateNote(id, editTitle, editContent)
    setEditingId(null)
    setIsSubmitting(false)
  }

  const startEditing = (id: number, title: string, content: string) => {
    setEditingId(id)
    setEditTitle(title)
    setEditContent(content)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes Notes</CardTitle>
          <CardDescription>Connectez-vous pour gérer vos notes</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Notes</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle note
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <form onSubmit={handleAddNote}>
            <CardHeader>
              <CardTitle>Nouvelle note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input placeholder="Titre" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div>
                <Textarea
                  placeholder="Contenu"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Vous n'avez pas encore de notes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              {editingId === note.id ? (
                <>
                  <CardHeader>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="font-bold text-lg"
                    />
                  </CardHeader>
                  <CardContent>
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4 mr-2" /> Annuler
                    </Button>
                    <Button onClick={() => handleUpdateNote(note.id)} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Enregistrer
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: fr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEditing(note.id, note.title, note.content)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
