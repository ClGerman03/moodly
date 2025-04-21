/**
 * Servicio para interactuar con la tabla 'boards' de Supabase
 * 
 * Este servicio proporciona métodos para crear, leer, actualizar y eliminar
 * tableros en la base de datos Supabase.
 */

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

// Tipos específicos para este servicio
export type Board = Database['public']['Tables']['boards']['Row'];
export type InsertBoard = Database['public']['Tables']['boards']['Insert'];
export type UpdateBoard = Database['public']['Tables']['boards']['Update'];

/**
 * Servicio para manejar operaciones CRUD de tableros
 */
export const boardService = {
  /**
   * Crea un nuevo tablero en la base de datos
   * @param boardData - Datos del tablero a crear
   * @returns El nuevo tablero creado
   */
  async createBoard(boardData: InsertBoard): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .insert(boardData)
      .select()
      .single();
    
    if (error) throw new Error(`Error al crear tablero: ${error.message}`);
    if (!data) throw new Error('No se pudo crear el tablero');
    
    return data;
  },

  /**
   * Obtiene un tablero por su slug
   * @param slug - Slug único del tablero
   * @returns El tablero encontrado o null si no existe
   */
  async getBoardBySlug(slug: string): Promise<Board | null> {
    const { data, error } = await supabase
      .from('boards')
      .select()
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 es "No se encontraron resultados"
      throw new Error(`Error al obtener tablero: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Obtiene un tablero por su ID
   * @param id - ID único del tablero
   * @returns El tablero encontrado o null si no existe
   */
  async getBoardById(id: string): Promise<Board | null> {
    const { data, error } = await supabase
      .from('boards')
      .select()
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener tablero: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Obtiene todos los tableros de un usuario
   * @param userId - ID del usuario
   * @returns Lista de tableros del usuario
   */
  async getBoardsByUser(userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from('boards')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Error al obtener tableros: ${error.message}`);
    
    return data || [];
  },

  /**
   * Actualiza un tablero existente
   * @param id - ID del tablero a actualizar
   * @param updates - Datos a actualizar
   * @returns El tablero actualizado
   */
  async updateBoard(id: string, updates: UpdateBoard): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar tablero: ${error.message}`);
    if (!data) throw new Error('No se pudo actualizar el tablero');
    
    return data;
  },

  /**
   * Publica un tablero (actualiza is_published a true y asegura que tiene un slug válido)
   * @param id - ID del tablero a publicar
   * @param slug - Slug para el tablero publicado
   * @returns El tablero publicado
   */
  async publishBoard(id: string, slug: string): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .update({
        is_published: true,
        slug,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al publicar tablero: ${error.message}`);
    if (!data) throw new Error('No se pudo publicar el tablero');
    
    return data;
  },

  /**
   * Elimina un tablero
   * @param id - ID del tablero a eliminar
   * @returns Verdadero si se eliminó correctamente
   */
  async deleteBoard(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Error al eliminar tablero: ${error.message}`);
    
    return true;
  },

  /**
   * Verifica si un slug está disponible
   * @param slug - Slug a verificar
   * @returns Verdadero si el slug está disponible
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', slug);
    
    if (error) throw new Error(`Error al verificar slug: ${error.message}`);
    
    return (data || []).length === 0;
  },

  /**
   * Migra un tablero desde localStorage a Supabase
   * @param slug - Slug del tablero en localStorage
   * @param userId - ID del usuario actual
   * @returns El tablero migrado si existía en localStorage, o null si no existía
   */
  async migrateFromLocalStorage(slug: string, userId: string): Promise<Board | null> {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return null;
    
    const localData = localStorage.getItem(`moodly-board-${slug}`);
    if (!localData) return null;
    
    try {
      const boardData = JSON.parse(localData);
      
      // Crear el tablero en Supabase
      const newBoard = await this.createBoard({
        name: boardData.name,
        slug,
        user_id: userId,
        is_published: boardData.isPublished || false,
        created_at: boardData.createdAt,
        updated_at: boardData.updatedAt || new Date().toISOString()
      });
      
      return newBoard;
    } catch (error) {
      console.error('Error al migrar tablero desde localStorage:', error);
      return null;
    }
  }
};
