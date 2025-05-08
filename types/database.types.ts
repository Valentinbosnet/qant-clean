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
      conversations: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          creator_id: string
          recipient_id: string
          title: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          creator_id: string
          recipient_id: string
          title?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          creator_id?: string
          recipient_id?: string
          title?: string | null
        }
      }
      messages: {
        Row: {
          id: number
          created_at: string
          conversation_id: number
          sender_id: string
          content: string
          read: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          conversation_id: number
          sender_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          conversation_id?: number
          sender_id?: string
          content?: string
          read?: boolean
        }
      }
      notifications: {
        Row: {
          id: number
          created_at: string
          user_id: string
          type: string
          title: string
          content: string
          link: string | null
          read: boolean
          sender_id: string | null
          reference_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          type: string
          title: string
          content: string
          link?: string | null
          read?: boolean
          sender_id?: string | null
          reference_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          type?: string
          title?: string
          content?: string
          link?: string | null
          read?: boolean
          sender_id?: string | null
          reference_id?: string | null
        }
      }
      notification_preferences: {
        Row: {
          id: number
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          in_app_enabled: boolean
          message_notifications: boolean
          system_notifications: boolean
        }
        Insert: {
          id?: number
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          in_app_enabled?: boolean
          message_notifications?: boolean
          system_notifications?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          in_app_enabled?: boolean
          message_notifications?: boolean
          system_notifications?: boolean
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
