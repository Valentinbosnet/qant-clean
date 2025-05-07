import { getBrowserClient, createServerClient } from "./supabase-config"

// Types pour les notes
export type Note = {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
}

export type NewNote = {
  title: string
  content: string
}

// Fonction pour obtenir le client Supabase approprié
const getClient = () => {
  if (typeof window === "undefined") {
    // Côté serveur
    return createServerClient()
  } else {
    // Côté client
    return getBrowserClient()
  }
}

// Service pour les notes
export const notesService = {
  // Récupérer toutes les notes de l'utilisateur
  async getNotes(): Promise<Note[]> {
    const client = getClient()
    const { data, error } = await client.from("notes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des notes:", error)
      throw error
    }

    return data || []
  },

  // Créer une nouvelle note
  async createNote(note: NewNote): Promise<Note> {
    const client = getClient()
    const { data, error } = await client.from("notes").insert(note).select().single()

    if (error) {
      console.error("Erreur lors de la création de la note:", error)
      throw error
    }

    return data
  },

  // Mettre à jour une note existante
  async updateNote(id: number, note: Partial<NewNote>): Promise<Note> {
    const client = getClient()
    const { data, error } = await client.from("notes").update(note).eq("id", id).select().single()

    if (error) {
      console.error("Erreur lors de la mise à jour de la note:", error)
      throw error
    }

    return data
  },

  // Supprimer une note
  async deleteNote(id: number): Promise<void> {
    const client = getClient()
    const { error } = await client.from("notes").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression de la note:", error)
      throw error
    }
  },

  // S'abonner aux changements de notes
  subscribeToNotes(callback: (notes: Note[]) => void): () => void {
    // Cette fonction ne doit être appelée que côté client
    if (typeof window === "undefined") {
      console.warn("subscribeToNotes ne doit être appelé que côté client")
      return () => {}
    }

    const client = getBrowserClient()

    const subscription = client
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
        },
        async () => {
          // Récupérer les notes mises à jour
          const { data } = await client.from("notes").select("*").order("created_at", { ascending: false })

          if (data) {
            callback(data)
          }
        },
      )
      .subscribe()

    // Retourner une fonction pour se désabonner
    return () => {
      subscription.unsubscribe()
    }
  },
}
