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

/**
 * Tipos comunes para componentes de feedback
 */
export type FeedbackReactionType = 'positive' | 'negative' | 'neutral';

export interface FeedbackItem {
  id: string;
  type: FeedbackReactionType;
  reaction: FeedbackReactionType;
  timestamp: string;
}

export interface FeedbackComment {
  itemId: string;
  comment: string;
  timestamp: string;
}

export interface PaletteFeedback {
  paletteId: string;
  type: FeedbackReactionType;
  timestamp: string;
}

export interface PaletteComment {
  paletteId: string;
  comment: string;
  timestamp: string;
}

export interface SectionFeedback {
  feedbackItems: Record<string, FeedbackItem>;
  comments?: FeedbackComment[];
  paletteFeedbacks?: PaletteFeedback[];
  paletteComments?: PaletteComment[];
  imageFeedback?: Record<string, string>;
}

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
      board_reviews: {
        Row: {
          id: string
          board_id: string
          reviewer_name: string
          last_viewed_section: number | null
          completed: boolean | null
          last_updated: string | null
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          reviewer_name: string
          last_viewed_section?: number | null
          completed?: boolean | null
          last_updated?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          reviewer_name?: string
          last_viewed_section?: number | null
          completed?: boolean | null
          last_updated?: string | null
          created_at?: string
        }
      }
      feedback_items: {
        Row: {
          id: string
          board_id: string | null
          section_id: string
          reviewer_id: string | null
          item_id: string
          reaction: string | null
          comment: string | null
          comment_timestamp: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          board_id?: string | null
          section_id: string
          reviewer_id?: string | null
          item_id: string
          reaction?: string | null
          comment?: string | null
          comment_timestamp?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          board_id?: string | null
          section_id?: string
          reviewer_id?: string | null
          item_id?: string
          reaction?: string | null
          comment?: string | null
          comment_timestamp?: string | null
          created_at?: string | null
          updated_at?: string | null
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
