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
          title: string
          content: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          title: string
          content: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          title?: string
          content?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
