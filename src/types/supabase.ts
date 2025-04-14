/**
 * Tipos para Supabase
 * 
 * Este archivo define los tipos de datos para las tablas de Supabase,
 * permitiendo un uso tipado de la base de datos en toda la aplicación.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          updated_at: string | null
          display_name: string | null
          theme_preference: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          display_name?: string | null
          theme_preference?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          display_name?: string | null
          theme_preference?: string | null
        }
      }
      moodboards: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          content: Json | null
          is_public: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
          content?: Json | null
          is_public?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
          content?: Json | null
          is_public?: boolean
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
