/**
 * Servicio para gestionar el feedback de los tableros
 * 
 * Este servicio proporciona métodos para guardar y recuperar el feedback
 * de los tableros, tanto desde localStorage como desde Supabase.
 */

import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

// Tipos específicos para este servicio
export type BoardReview = Database['public']['Tables']['board_reviews']['Row'];
export type InsertBoardReview = Database['public']['Tables']['board_reviews']['Insert'];
export type UpdateBoardReview = Database['public']['Tables']['board_reviews']['Update'];
export type FeedbackItem = Database['public']['Tables']['feedback_items']['Row'];
export type InsertFeedbackItem = Database['public']['Tables']['feedback_items']['Insert'];
export type UpdateFeedbackItem = Database['public']['Tables']['feedback_items']['Update'];

// Interfaces para el feedback
export interface BoardFeedback {
  boardId: string;
  clientName: string;
  responses: Record<string, Record<string, unknown>>;
  lastViewedSection: number;
  lastUpdated: string;
}

/**
 * Servicio para manejar operaciones relacionadas con el feedback de los tableros
 */
export const feedbackService = {
  /**
   * Guarda el feedback en localStorage
   * @param slug - Slug del tablero
   * @param clientName - Nombre del cliente que deja el feedback
   * @param feedback - Datos del feedback
   * @param lastViewedSection - Índice de la última sección vista
   * @returns Verdadero si se guardó correctamente
   */
  saveLocalFeedback(
    slug: string, 
    clientName: string, 
    feedback: Record<string, Record<string, unknown>>,
    lastViewedSection: number
  ): boolean {
    try {
      if (!slug || !clientName) return false;
      
      const feedbackData: BoardFeedback = {
        boardId: slug,
        clientName,
        responses: feedback,
        lastViewedSection,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(
        `moodly-feedback-${slug}-${clientName}`, 
        JSON.stringify(feedbackData)
      );
      
      return true;
    } catch (error) {
      console.error("Error guardando feedback en localStorage:", error);
      return false;
    }
  },

  /**
   * Obtiene el feedback guardado en localStorage
   * @param slug - Slug del tablero
   * @param clientName - Nombre del cliente
   * @returns Datos del feedback o null si no existe
   */
  getLocalFeedback(slug: string, clientName: string): BoardFeedback | null {
    try {
      if (!slug || !clientName) return null;
      
      const savedFeedback = localStorage.getItem(`moodly-feedback-${slug}-${clientName}`);
      if (!savedFeedback) return null;
      
      return JSON.parse(savedFeedback) as BoardFeedback;
    } catch (error) {
      console.error("Error recuperando feedback de localStorage:", error);
      return null;
    }
  },

  /**
   * Comprueba si hay feedback guardado para un tablero y cliente específicos
   * @param slug - Slug del tablero
   * @param clientName - Nombre del cliente
   * @returns Verdadero si existe feedback guardado
   */
  hasFeedback(slug: string, clientName: string): boolean {
    if (!slug || !clientName) return false;
    
    const localFeedback = this.getLocalFeedback(slug, clientName);
    return localFeedback !== null;
  },
  
  /**
   * Guarda una revisión completa de tablero en Supabase
   * @param boardId - ID del tablero
   * @param reviewerName - Nombre del revisor
   * @param feedback - Datos de feedback por secciones
   * @param lastViewedSection - Índice de la última sección vista
   * @returns Los datos de la revisión creada
   */
  async saveBoardReview(
    boardId: string,
    reviewerName: string,
    feedback: Record<string, Record<string, unknown>>,
    lastViewedSection: number
  ): Promise<BoardReview> {
    // Crear la revisión principal
    const { data: reviewData, error: reviewError } = await supabase
      .from('board_reviews')
      .insert({
        board_id: boardId,
        reviewer_name: reviewerName,
        last_viewed_section: lastViewedSection,
        completed: true,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
    
    if (reviewError) throw new Error(`Error creating board review: ${reviewError.message}`);
    if (!reviewData) throw new Error('No se pudo crear la revisión');
    
    // Procesar el feedback y guardar los elementos individuales
    await this.saveFeedbackItems(reviewData.id, boardId, feedback);
    
    return reviewData;
  },
  
  /**
   * Guarda los elementos individuales de feedback
   * @param reviewerId - ID de la revisión
   * @param boardId - ID del tablero
   * @param feedback - Datos de feedback por secciones
   * @returns Array de elementos de feedback guardados
   */
  async saveFeedbackItems(
    reviewerId: string,
    boardId: string,
    feedback: Record<string, Record<string, unknown>>
  ): Promise<FeedbackItem[]> {
    const items: InsertFeedbackItem[] = [];
    
    // Recorrer todas las secciones con feedback
    for (const sectionId in feedback) {
      const sectionFeedback = feedback[sectionId];
      
      // Procesar diferentes tipos de feedback según la estructura
      if (sectionFeedback.feedbackItems) {
        // Para feedback de elementos como imágenes, tipografías, etc.
        const feedbackItems = sectionFeedback.feedbackItems as Record<string, {
          itemId: string;
          reaction?: 'positive' | 'negative' | 'neutral';
          comments?: { text: string; timestamp: string }[];
        }>;
        
        for (const itemId in feedbackItems) {
          const item = feedbackItems[itemId];
          
          // Si hay comentarios, crear un registro para cada comentario
          // y asignar la reacción al primer comentario (si existe)
          if (item.comments && item.comments.length > 0) {
            for (let i = 0; i < item.comments.length; i++) {
              const comment = item.comments[i];
              items.push({
                board_id: boardId,
                section_id: sectionId,
                reviewer_id: reviewerId,
                item_id: itemId,
                // Asignar la reacción solo al primer comentario
                reaction: i === 0 && item.reaction ? item.reaction : null,
                comment: comment.text,
                comment_timestamp: comment.timestamp,
              });
            }
          } 
          // Si no hay comentarios pero hay reacción, crear un registro solo para la reacción
          else if (item.reaction) {
            items.push({
              board_id: boardId,
              section_id: sectionId,
              reviewer_id: reviewerId,
              item_id: itemId,
              reaction: item.reaction,
              comment: null,
            });
          }
        }
      }
      
      
      // Procesar paletas de colores
      if (sectionFeedback.paletteFeedbacks) {
        const paletteFeedbacks = sectionFeedback.paletteFeedbacks as {
          paletteId: string;
          type: 'positive' | 'negative' | 'neutral';
          timestamp: string;
        }[];
        
        for (const palette of paletteFeedbacks) {
          items.push({
            board_id: boardId,
            section_id: sectionId,
            reviewer_id: reviewerId,
            item_id: palette.paletteId,
            reaction: palette.type,
            comment: null,
          });
        }
      }
      
      // Procesar comentarios de paletas
      if (sectionFeedback.paletteComments) {
        const paletteComments = sectionFeedback.paletteComments as {
          paletteId: string;
          comment: string;
          timestamp: string;
        }[];
        
        for (const comment of paletteComments) {
          items.push({
            board_id: boardId,
            section_id: sectionId,
            reviewer_id: reviewerId,
            item_id: comment.paletteId,
            reaction: null,
            comment: comment.comment,
            comment_timestamp: comment.timestamp,
          });
        }
      }
      
      // Procesar feedback de imágenes
      if (sectionFeedback.imageFeedback) {
        const imageFeedback = sectionFeedback.imageFeedback as Record<string, string>;
        
        for (const imageId in imageFeedback) {
          items.push({
            board_id: boardId,
            section_id: sectionId,
            reviewer_id: reviewerId,
            item_id: imageId,
            reaction: imageFeedback[imageId] as 'positive' | 'negative' | 'neutral',
            comment: null,
          });
        }
      }
      
      // Procesar comentarios generales
      if (sectionFeedback.comments) {
        const comments = sectionFeedback.comments as {
          itemId: string;
          comment: string;
          timestamp: string;
        }[];
        
        for (const comment of comments) {
          items.push({
            board_id: boardId,
            section_id: sectionId,
            reviewer_id: reviewerId,
            item_id: comment.itemId,
            reaction: null,
            comment: comment.comment,
            comment_timestamp: comment.timestamp,
          });
        }
      }
    }
    
    if (items.length === 0) {
      return [];
    }
    
    // Eliminar duplicados para evitar el error "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const uniqueItems = this.removeDuplicateFeedbackItems(items);
    
    // Guardar todos los elementos de feedback usando upsert para actualizar registros existentes
    // Esto resuelve el error de clave duplicada utilizando la restricción única definida en la tabla
    const { data, error } = await supabase
      .from('feedback_items')
      .upsert(uniqueItems, { onConflict: 'board_id,section_id,reviewer_id,item_id' })
      .select();
    
    if (error) throw new Error(`Error saving feedback items: ${error.message}`);
    
    return data || [];
  },
  
  /**
   * Obtiene los datos de una revisión de tablero desde Supabase
   * @param boardId - ID del tablero
   * @param reviewerName - Nombre del revisor
   * @returns Datos de la revisión o null si no existe
   */
  async getBoardReview(boardId: string, reviewerName: string): Promise<BoardReview | null> {
    const { data, error } = await supabase
      .from('board_reviews')
      .select()
      .eq('board_id', boardId)
      .eq('reviewer_name', reviewerName)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 es "No se encontraron resultados"
      throw new Error(`Error getting board review: ${error.message}`);
    }
    
    return data;
  },
  
  /**
   * Obtiene todos los elementos de feedback para una revisión específica
   * @param reviewId - ID de la revisión
   * @returns Lista de elementos de feedback
   */
  async getFeedbackItems(reviewId: string): Promise<FeedbackItem[]> {
    const { data, error } = await supabase
      .from('feedback_items')
      .select()
      .eq('reviewer_id', reviewId);
    
    if (error) throw new Error(`Error getting feedback items: ${error.message}`);
    
    return data || [];
  },
  
  /**
   * Obtiene todos los elementos de feedback para un tablero específico
   * @param boardId - ID del tablero
   * @returns Lista de elementos de feedback
   */
  async getFeedbackItemsByBoardId(boardId: string): Promise<FeedbackItem[]> {
    const { data, error } = await supabase
      .from('feedback_items')
      .select()
      .eq('board_id', boardId);
    
    if (error) throw new Error(`Error getting feedback items: ${error.message}`);
    
    return data || [];
  },
  
  /**
   * Elimina elementos duplicados del array de feedback items
   * @param items - Array de elementos de feedback
   * @returns Array sin elementos duplicados
   */
  removeDuplicateFeedbackItems(items: InsertFeedbackItem[]): InsertFeedbackItem[] {
    // Usamos un Map para rastrear elementos únicos usando una clave compuesta
    const uniqueMap = new Map<string, InsertFeedbackItem>();
    
    for (const item of items) {
      // Crear una clave única basada en los campos que componen la restricción
      const key = `${item.board_id}|${item.section_id}|${item.reviewer_id}|${item.item_id}`;
      
      // Si ya existe un elemento con esta clave
      if (uniqueMap.has(key)) {
        const existingItem = uniqueMap.get(key)!;
        
        // Preservar la reacción si existe en cualquiera de los dos registros
        // Priorizar la reacción del elemento actual si ambos tienen reacción
        if (item.reaction) {
          existingItem.reaction = item.reaction;
        }
        
        // Preservar el comentario si existe en cualquiera de los dos registros
        // Si el elemento actual tiene comentario, usarlo en lugar del existente
        if (item.comment) {
          existingItem.comment = item.comment;
          existingItem.comment_timestamp = item.comment_timestamp;
        }
        
        uniqueMap.set(key, existingItem);
      } else {
        uniqueMap.set(key, item);
      }
    }
    
    // Convertir el Map de vuelta a un array
    return Array.from(uniqueMap.values());
  },
  
  /**
   * Migra el feedback de localStorage a Supabase
   * @param slug - Slug del tablero
   * @param boardId - ID del tablero en Supabase
   * @returns Datos de la revisión migrada o null si no había datos
   */
  async migrateFromLocalStorage(slug: string, boardId: string): Promise<BoardReview | null> {
    if (typeof window === 'undefined') return null;
    
    // Buscar en localStorage todos los elementos con el patrón "moodly-feedback-{slug}-*"
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(`moodly-feedback-${slug}-`)) continue;
        
        const item = localStorage.getItem(key);
        if (!item) continue;
        
        const feedbackData = JSON.parse(item);
        if (!feedbackData.clientName || !feedbackData.responses) continue;
        
        // Migrar a Supabase
        const reviewData = await this.saveBoardReview(
          boardId,
          feedbackData.clientName,
          feedbackData.responses,
          feedbackData.lastViewedSection || 0
        );
        
        return reviewData;
      }
    } catch (error) {
      console.error('Error migrating feedback from localStorage:', error);
    }
    
    return null;
  },

  /**
   * Obtiene todas las revisiones (board_reviews) de un tablero
   * @param boardId - ID del tablero
   * @returns Lista de revisiones
   */
  async getBoardReviews(boardId: string): Promise<BoardReview[]> {
    try {
      const { data, error } = await supabase
        .from('board_reviews')
        .select()
        .eq('board_id', boardId);
      
      if (error) throw new Error(`Error getting board reviews: ${error.message}`);
      
      return data || [];
    } catch (error) {
      console.error('Error getting board reviews:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene los elementos de feedback para un tablero, agrupados por revisor
   * @param boardId - ID del tablero
   * @returns Datos de feedback agrupados por revisor con estadísticas
   */
  async getBoardFeedbackAnalytics(boardId: string): Promise<{
    reviewers: {
      id: string;
      name: string;
      lastUpdated: string;
      completed: boolean;
      itemCount: number;
    }[];
    feedbackStats: {
      totalReactions: number;
      positiveReactions: number;
      negativeReactions: number;
      neutralReactions: number;
      totalComments: number;
      commentsBySection: Record<string, number>;
    };
    feedbackItems: Record<string, FeedbackItem[]>;
  }> {
    try {
      // 1. Obtener todas las revisiones del tablero
      const reviews = await this.getBoardReviews(boardId);
      
      // 2. Obtener todos los elementos de feedback para este tablero
      const { data: feedbackItems, error } = await supabase
        .from('feedback_items')
        .select()
        .eq('board_id', boardId);
      
      if (error) throw new Error(`Error getting feedback items: ${error.message}`);
      
      // 3. Preparar estructura de datos
      const reviewersData = reviews.map(review => ({
        id: review.id,
        name: review.reviewer_name,
        lastUpdated: review.last_updated || review.created_at,
        completed: review.completed || false,
        itemCount: 0
      }));
      
      // 4. Agrupar items por revisor
      const itemsByReviewer: Record<string, FeedbackItem[]> = {};
      const stats = {
        totalReactions: 0,
        positiveReactions: 0,
        negativeReactions: 0,
        neutralReactions: 0,
        totalComments: 0,
        commentsBySection: {} as Record<string, number>
      };
      
      // Procesar todos los items de feedback
      if (feedbackItems) {
        for (const item of feedbackItems) {
          // Agregar al contador del revisor correspondiente
          const reviewerIndex = reviewersData.findIndex(r => r.id === item.reviewer_id);
          if (reviewerIndex !== -1) {
            reviewersData[reviewerIndex].itemCount++;
          }
          
          // Agrupar por revisor
          if (!itemsByReviewer[item.reviewer_id || '']) {
            itemsByReviewer[item.reviewer_id || ''] = [];
          }
          itemsByReviewer[item.reviewer_id || ''].push(item);
          
          // Actualizar estadísticas generales
          if (item.reaction) {
            stats.totalReactions++;
            if (item.reaction === 'positive') stats.positiveReactions++;
            else if (item.reaction === 'negative') stats.negativeReactions++;
            else stats.neutralReactions++;
          }
          
          if (item.comment) {
            stats.totalComments++;
            
            // Contar comentarios por sección
            if (!stats.commentsBySection[item.section_id]) {
              stats.commentsBySection[item.section_id] = 0;
            }
            stats.commentsBySection[item.section_id]++;
          }
        }
      }
      
      // 5. Devolver datos estructurados
      return {
        reviewers: reviewersData,
        feedbackStats: stats,
        feedbackItems: itemsByReviewer
      };
      
    } catch (error) {
      console.error('Error getting board feedback analytics:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene todos los detalles de feedback de un revisor específico
   * @param reviewerId - ID del revisor
   * @returns Detalles completos del feedback del revisor
   */
  async getReviewerFeedbackDetails(reviewerId: string): Promise<{
    reviewer: BoardReview;
    feedbackItems: FeedbackItem[];
  }> {
    try {
      // 1. Obtener datos del revisor
      const { data: reviewer, error: reviewerError } = await supabase
        .from('board_reviews')
        .select()
        .eq('id', reviewerId)
        .single();
      
      if (reviewerError) throw new Error(`Error getting reviewer details: ${reviewerError.message}`);
      if (!reviewer) throw new Error(`Reviewer not found with id: ${reviewerId}`);
      
      // 2. Obtener items de feedback del revisor
      const { data: feedbackItems, error: itemsError } = await supabase
        .from('feedback_items')
        .select()
        .eq('reviewer_id', reviewerId);
      
      if (itemsError) throw new Error(`Error getting reviewer feedback items: ${itemsError.message}`);
      
      return {
        reviewer,
        feedbackItems: feedbackItems || []
      };
      
    } catch (error) {
      console.error('Error getting reviewer feedback details:', error);
      throw error;
    }
  }
};
