export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          website: string | null
          theme: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          theme?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          theme?: string | null
        }
      }
      favorites: {
        Row: {
          id: number
          created_at: string
          user_id: string
          stock_symbol: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          stock_symbol: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          stock_symbol?: string
        }
      }
      notes: {
        Row: {
          id: number
          created_at: string
          user_id: string
          content: string
          title: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          content: string
          title: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          content?: string
          title?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_favorites_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
  storage: {
    Buckets: {
      [_ in never]: never
    }
    Objects: {
      [_ in never]: never
    }
  }
}
