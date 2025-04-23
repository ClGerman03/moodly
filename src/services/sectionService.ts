/**
 * Servicio para interactuar con la tabla 'board_sections' de Supabase
 * 
 * Este servicio proporciona métodos para crear, leer, actualizar y eliminar
 * secciones de tableros en la base de datos Supabase.
 */

import { Json } from "@/types/supabase";
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Section } from '@/app/tablero/types';
import { prepareForStorage } from '@/utils/serialization/sectionAdapters';
import { storageService } from './storageService';

// Tipos específicos para este servicio
export type BoardSection = Database['public']['Tables']['board_sections']['Row'];
export type InsertBoardSection = Database['public']['Tables']['board_sections']['Insert'];
export type UpdateBoardSection = Database['public']['Tables']['board_sections']['Update'];

/**
 * Servicio para manejar operaciones CRUD de secciones de tableros
 */
export const sectionService = {
  /**
   * Guarda una colección de secciones para un tablero
   * @param boardId - ID del tablero
   * @param sections - Secciones a guardar
   * @returns Las secciones guardadas
   */
  async saveSections(boardId: string, sections: Section[]): Promise<BoardSection[]> {
    // Primero eliminamos cualquier sección existente para este tablero
    // para evitar conflictos y datos huérfanos
    await this.deleteAllSections(boardId);
    
    console.log("sectionService: Procesando secciones para guardado:", sections);
    
    // Procesamos las imágenes solo para secciones de tipo imageGallery que no hayan sido procesadas
    // Identificamos si una sección ya fue procesada comprobando si sus datos contienen la estructura esperada
    const sectionsWithProcessedImages = await Promise.all(
      sections.map(async section => {
        // Solo procesamos las imágenes para secciones de tipo imageGallery
        if (section.type === 'imageGallery') {
          // Comprobamos si la sección ya tiene imágenes procesadas (rutas de Supabase Storage)
          const isAlreadyProcessed = section.data && 
                                    section.data.images && 
                                    Array.isArray(section.data.images) && 
                                    section.data.images.length > 0 && 
                                    typeof section.data.images[0] === 'string' && 
                                    section.data.images[0].includes('storage.googleapis');
          
          if (!isAlreadyProcessed) {
            console.log(`Procesando imágenes para sección ${section.id} (tipo: ${section.type})`);
            return await storageService.processSectionImages(section, boardId);
          }
        }
        
        // Para otros tipos de sección o si ya estaban procesadas, devolvemos la sección sin cambios
        console.log(`Sección ${section.id} (tipo: ${section.type}) no requiere procesamiento de imágenes`);
        return section;
      })
    );
    
    // Preparamos las secciones para almacenamiento
    console.log("sectionService: Preparando secciones para almacenamiento", sectionsWithProcessedImages);
    const preparedSections = prepareForStorage(sectionsWithProcessedImages as unknown as Section[]);
    
    // Convertimos al formato de la tabla
    // Usamos el tipo Json para la conversión
    
    const sectionRows: InsertBoardSection[] = preparedSections.map((section: {id: string; type: string; title?: string; description?: string; data?: Record<string, unknown>}, index) => ({
      board_id: boardId,
      section_id: section.id,
      type: section.type,
      title: section.title || null,
      description: section.description || null,
      data: section.data as Json || null,
      order: index
    }));
    
    if (sectionRows.length === 0) return [];
    
    const { data, error } = await supabase
      .from('board_sections')
      .insert(sectionRows)
      .select();
    
    if (error) throw new Error(`Error al guardar secciones: ${error.message}`);
    
    return data || [];
  },

  /**
   * Obtiene todas las secciones de un tablero
   * @param boardId - ID del tablero
   * @returns Lista de secciones ordenadas por el campo 'order'
   */
  async getSectionsByBoardId(boardId: string): Promise<BoardSection[]> {
    const { data, error } = await supabase
      .from('board_sections')
      .select()
      .eq('board_id', boardId)
      .order('order');
    
    if (error) throw new Error(`Error al obtener secciones: ${error.message}`);
    
    return data || [];
  },

  /**
   * Obtiene todas las secciones de un tablero por su slug
   * @param slug - Slug del tablero
   * @returns Lista de secciones ordenadas por el campo 'order'
   */
  async getSectionsByBoardSlug(slug: string): Promise<BoardSection[]> {
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (boardError) throw new Error(`Error al obtener tablero: ${boardError.message}`);
    if (!board) throw new Error(`No se encontró el tablero con slug: ${slug}`);
    
    return this.getSectionsByBoardId(board.id);
  },

  /**
   * Obtiene una sección específica por su ID
   * @param boardId - ID del tablero
   * @param sectionId - ID de la sección
   * @returns La sección encontrada o null si no existe
   */
  async getSectionById(boardId: string, sectionId: string): Promise<BoardSection | null> {
    const { data, error } = await supabase
      .from('board_sections')
      .select()
      .eq('board_id', boardId)
      .eq('section_id', sectionId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener sección: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Actualiza una sección específica
   * @param id - ID de la sección en la base de datos
   * @param updates - Datos a actualizar
   * @returns La sección actualizada
   */
  async updateSection(id: string, updates: UpdateBoardSection): Promise<BoardSection> {
    const { data, error } = await supabase
      .from('board_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar sección: ${error.message}`);
    if (!data) throw new Error('No se pudo actualizar la sección');
    
    return data;
  },

  /**
   * Actualiza el contenido de datos de una sección
   * @param id - ID de la sección
   * @param sectionData - Nuevos datos para la sección
   * @returns La sección actualizada
   */
  async updateSectionData(id: string, sectionData: Record<string, unknown>): Promise<BoardSection> {
    const { data, error } = await supabase
      .from('board_sections')
      .update({
        data: sectionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar datos de sección: ${error.message}`);
    if (!data) throw new Error('No se pudo actualizar la sección');
    
    return data;
  },

  /**
   * Elimina una sección específica
   * @param id - ID de la sección a eliminar
   * @returns Verdadero si se eliminó correctamente
   */
  async deleteSection(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('board_sections')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Error al eliminar sección: ${error.message}`);
    
    return true;
  },

  /**
   * Elimina todas las secciones de un tablero
   * @param boardId - ID del tablero
   * @returns Verdadero si se eliminaron correctamente
   */
  async deleteAllSections(boardId: string): Promise<boolean> {
    const { error } = await supabase
      .from('board_sections')
      .delete()
      .eq('board_id', boardId);
    
    if (error) throw new Error(`Error al eliminar secciones: ${error.message}`);
    
    return true;
  },

  /**
   * Migra secciones desde localStorage a Supabase
   * @param slug - Slug del tablero en localStorage
   * @param boardId - ID del tablero en Supabase
   * @returns Las secciones migradas o null si no existían
   */
  async migrateSectionsFromLocalStorage(slug: string, boardId: string): Promise<BoardSection[] | null> {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return null;
    
    const localData = localStorage.getItem(`moodly-board-${slug}`);
    if (!localData) return null;
    
    try {
      const boardData = JSON.parse(localData);
      
      if (!boardData.sections || !Array.isArray(boardData.sections)) {
        return null;
      }
      
      // Guardar las secciones en Supabase
      return await this.saveSections(boardId, boardData.sections);
    } catch (error) {
      console.error('Error al migrar secciones desde localStorage:', error);
      return null;
    }
  }
};
