/**
 * Servicios de la aplicación
 * 
 * Este archivo exporta todos los servicios disponibles para la aplicación.
 * Actúa como punto central para importar cualquier servicio.
 */

// Importamos y exportamos directamente
import { boardService } from './boardService';
import { sectionService } from './sectionService';
import { feedbackService } from './feedbackService';
import { storageService } from './storageService';

// Re-exportamos los servicios
export { boardService, sectionService, feedbackService, storageService };
