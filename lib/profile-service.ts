import { createServerClient } from "@/lib/supabase-config"
import { getBrowserClient } from "@/lib/supabase-config"
import type { Database } from "@/types/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Service côté serveur
export const ProfileService = {
  async getProfile(userId: string) {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = No rows found
      console.error("Erreur lors de la récupération du profil:", error)
      throw error
    }

    return data
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      throw error
    }

    return data[0]
  },
}

// Hooks côté client
export function useProfileClient() {
  const supabase = getBrowserClient()

  return {
    async getProfile() {
      const { data, error } = await supabase.from("profiles").select("*").single()

      if (error && error.code !== "PGRST116") throw error
      return data
    },

    async updateProfile(updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .select()

      if (error) throw error
      return data[0]
    },

    subscribeToProfile(callback: (profile: Profile) => void) {
      const subscription = supabase
        .channel("profile_changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
          },
          (payload) => {
            // Récupérer le profil mis à jour
            this.getProfile().then(callback)
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    },
  }
}
