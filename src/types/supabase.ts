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
      boards: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          user_id: string
          is_published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          user_id: string
          is_published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          user_id?: string
          is_published?: boolean
        }
      }
      board_sections: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          board_id: string
          section_id: string
          type: string
          title: string | null
          description: string | null
          data: Json | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          board_id: string
          section_id: string
          type: string
          title?: string | null
          description?: string | null
          data?: Json | null
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          board_id?: string
          section_id?: string
          type?: string
          title?: string | null
          description?: string | null
          data?: Json | null
          order?: number
        }
      }
      board_feedback: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          board_id: string
          client_name: string
          section_id: string
          responses: Json | null
          last_viewed_section: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          board_id: string
          client_name: string
          section_id: string
          responses?: Json | null
          last_viewed_section?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          board_id?: string
          client_name?: string
          section_id?: string
          responses?: Json | null
          last_viewed_section?: number
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
