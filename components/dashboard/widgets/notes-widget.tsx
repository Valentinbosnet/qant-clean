"use client"

import { useState } from "react"
import { useNotes } from "@/hooks/use-notes"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash, Save, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface NotesWidgetProps {
  config: {
    settings: {
      maxNotes?: number
      showDateCreated?: boolean
      showStockSymbols?: boolean
    }
  }
}

export function NotesWidget({ config }: NotesWidgetProps) {
  const { settings } = config
  const maxNotes = settings.maxNotes || 5
  const showDateCreated = settings.showDateCreated !== false
  const showStockSymbols = settings.showStockSymbols !== false

  const { notes, addNote, updateNote, deleteNote, loading } = useNotes()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState("")

  const handleEdit = (id: string, content: string) => {
    setEditingId(id)
    setEditContent(content)
  }

  const handleSave = async (id: string) => {
    if (editContent.trim()) {
      await updateNote(id, { content: editContent })
    }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      await deleteNote(id)
    }
  }

  const handleAddNote = async () => {
    if (newNoteContent.trim()) {
      await addNote({
        content: newNoteContent,
        stock_symbols: extractStockSymbols(newNoteContent),
      })
      setNewNoteContent("")
      setIsAddingNote(false)
    }
  }

  const extractStockSymbols = (content: string): string[] => {
    // Recherche des symboles boursiers dans le format $SYMBOL
    const matches = content.match(/\$([A-Z]{1,5})/g) || []
    return matches.map((match) => match.substring(1))
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  const displayedNotes = notes.slice(0, maxNotes)

  return (
    <div className="space-y-3 h-full">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
        <Button variant="outline" size="sm" onClick={() => setIsAddingNote(true)} disabled={isAddingNote}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Nouvelle note
        </Button>
      </div>

      {isAddingNote && (
        <div className="border rounded-md p-2 space-y-2">
          <Textarea
            placeholder="Écrivez votre note ici... Utilisez $SYMBOL pour mentionner des actions"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingNote(false)
                setNewNoteContent("")
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleAddNote}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100%-60px)]">
        {displayedNotes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Aucune note. Cliquez sur "Nouvelle note" pour commencer.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotes.map((note) => (
              <div key={note.id} className="border rounded-md p-2 space-y-2">
                {editingId === note.id ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Annuler
                      </Button>
                      <Button size="sm" onClick={() => handleSave(note.id)}>
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Enregistrer
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      {showDateCreated && note.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEdit(note.id, note.content)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    {showStockSymbols && note.stock_symbols && note.stock_symbols.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.stock_symbols.map((symbol) => (
                          <Badge key={symbol} variant="outline" className="text-xs">
                            ${symbol}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
