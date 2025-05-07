import { createServerClient } from "@/lib/supabase-config"
import { getBrowserClient } from "@/lib/supabase-config"
import type { Database } from "@/types/database.types"

export type Note = Database["public"]["Tables"]["notes"]["Row"]

// Service côté serveur
export const NotesService = {
  async getNotes(userId: string) {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des notes:", error)
      throw error
    }

    return data || []
  },

  async createNote(userId: string, title: string, content: string) {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("notes")
      .insert([{ user_id: userId, title, content }])
      .select()

    if (error) {
      console.error("Erreur lors de la création de la note:", error)
      throw error
    }

    return data[0]
  },

  async updateNote(noteId: number, userId: string, updates: { title?: string; content?: string }) {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("notes").update(updates).eq("id", noteId).eq("user_id", userId).select()

    if (error) {
      console.error("Erreur lors de la mise à jour de la note:", error)
      throw error
    }

    return data[0]
  },

  async deleteNote(noteId: number, userId: string) {
    const supabase = createServerClient()

    const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", userId)

    if (error) {
      console.error("Erreur lors de la suppression de la note:", error)
      throw error
    }

    return true
  },
}

// Hooks côté client
export function useNotesClient() {
  const supabase = getBrowserClient()

  return {
    async getNotes() {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },

    async createNote(title: string, content: string) {
      const { data, error } = await supabase.from("notes").insert([{ title, content }]).select()

      if (error) throw error
      return data[0]
    },

    async updateNote(noteId: number, updates: { title?: string; content?: string }) {
      const { data, error } = await supabase.from("notes").update(updates).eq("id", noteId).select()

      if (error) throw error
      return data[0]
    },

    async deleteNote(noteId: number) {
      const { error } = await supabase.from("notes").delete().eq("id", noteId)

      if (error) throw error
      return true
    },

    subscribeToNotes(callback: (notes: Note[]) => void) {
      const subscription = supabase
        .channel("notes_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notes",
          },
          (payload) => {
            // Récupérer les notes mises à jour
            this.getNotes().then(callback)
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    },
  }
}
