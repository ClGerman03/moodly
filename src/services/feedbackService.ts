/**
 * Servicio para gestionar el feedback de los tableros
 * 
 * Este servicio proporciona métodos para guardar y recuperar el feedback
 * de los tableros, tanto desde localStorage como desde Supabase en el futuro.
 */

import { Database } from "@/types/supabase";

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
  }
  
  // Nota: A medida que implementemos Supabase para el feedback,
  // agregaremos aquí los métodos correspondientes para guardar y recuperar
  // feedback desde la base de datos.
};
