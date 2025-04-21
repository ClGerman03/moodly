/**
 * Adaptadores para convertir entre los formatos de Supabase y la aplicación
 * 
 * Este archivo contiene funciones para transformar los datos recibidos de Supabase
 * al formato esperado por los componentes de la aplicación, y viceversa.
 */

import { Section } from "@/app/tablero/types";
import { BoardSection } from "@/services/sectionService";
import { Board } from "@/services/boardService";
import { prepareForDisplay } from "@/utils/serialization/sectionAdapters";
import { storageService } from "@/services/storageService";

/**
 * Interfaz para la estructura esperada por los componentes de visualización
 */
export interface DisplayBoard {
  name: string;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  userId?: string;
}

/**
 * Convierte un tablero y sus secciones desde el formato de Supabase al formato de la aplicación
 * @param board - Datos del tablero desde Supabase
 * @param sections - Secciones del tablero desde Supabase
 * @returns El tablero en el formato esperado por los componentes
 */
export function adaptBoardForDisplay(board: Board, sections: BoardSection[]): DisplayBoard {
  // Ordenar secciones por el campo order
  const sortedSections = [...sections].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  // Convertir las secciones al formato de la aplicación
  const displaySections: Section[] = sortedSections.map(section => {
    // Crear una copia básica de la sección
    const displaySection: Section = {
      id: section.section_id,
      type: section.type as any, // Conversión segura ya que validamos los tipos en Supabase
      title: section.title || "",
      description: section.description || undefined,
      data: section.data as any || {}
    };
    
    // Procesar las imágenes si es una sección de tipo imageGallery
    if (displaySection.type === 'imageGallery' && displaySection.data?.images) {
      // Asegurarnos de que las URLs de las imágenes sean válidas
      // Supabase Storage nos devuelve URLs completas, así que no hay que modificarlas
      displaySection.data.images = displaySection.data.images.map((imageUrl: string) => {
        // Validar que la URL sea accesible
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('blob:'))) {
          return imageUrl;
        }
        // Si la URL no es válida, devolvemos una URL de placeholder
        return 'https://placehold.co/600x400?text=Image+Not+Found';
      });
    }
    
    return displaySection;
  });

  // Aplicar cualquier procesamiento adicional necesario para la visualización
  const processedSections = prepareForDisplay(displaySections);

  return {
    name: board.name,
    sections: processedSections,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
    isPublished: board.is_published,
    userId: board.user_id || undefined
  };
}

/**
 * Convierte un tablero desde el formato de localStorage al formato de la aplicación
 * @param localData - Datos del tablero desde localStorage (ya parseados)
 * @returns El tablero en el formato esperado por los componentes
 */
export function adaptLocalStorageBoardForDisplay(localData: any): DisplayBoard | null {
  if (!localData || typeof localData !== 'object' || !localData.name || !Array.isArray(localData.sections)) {
    return null;
  }

  // Procesar todas las secciones para manejar correctamente las imágenes
  const sectionsWithValidatedImages = localData.sections.map((section: any) => {
    // Crear una copia de la sección
    const processedSection = { ...section };
    
    // Procesar las imágenes si es una sección de tipo imageGallery
    if (section.type === 'imageGallery' && section.data?.images) {
      processedSection.data = { ...section.data };
      
      // Verificar si las URLs de blob siguen siendo válidas
      processedSection.data.images = section.data.images.map((imageUrl: string) => {
        // Para URLs de tipo blob, intentamos validar que aún existan
        if (imageUrl.startsWith('blob:')) {
          try {
            // Una forma sencilla de verificar si el blob existe es crear un Image y ver si carga
            // Pero como esto es asíncrono, solo mostramos un warning por consola si falla
            const img = new Image();
            img.onerror = () => {
              console.warn(`Blob URL no válida: ${imageUrl}`);
            };
            img.src = imageUrl;
            
            return imageUrl;
          } catch (e) {
            console.warn(`Error validando blob URL: ${imageUrl}`, e);
            // Fallback a una imagen de placeholder
            return 'https://placehold.co/600x400?text=Image+Not+Available';
          }
        }
        
        // Si es una URL normal (http, https), la devolvemos tal cual
        return imageUrl;
      });
    }
    
    return processedSection;
  });
  
  // Procesar las secciones
  const processedSections = prepareForDisplay(sectionsWithValidatedImages);

  return {
    name: localData.name,
    sections: processedSections,
    createdAt: localData.createdAt,
    updatedAt: localData.updatedAt,
    isPublished: localData.isPublished,
    userId: localData.userId
  };
}
