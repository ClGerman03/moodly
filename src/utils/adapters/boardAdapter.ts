/**
 * Adaptadores para convertir entre los formatos de Supabase y la aplicación
 * 
 * Este archivo contiene funciones para transformar los datos recibidos de Supabase
 * al formato esperado por los componentes de la aplicación, y viceversa.
 */

import { Section, SectionType } from "@/app/tablero/types";
import { BoardSection } from "@/services/sectionService";
import { Board } from "@/services/boardService";
import { prepareForDisplay } from "@/utils/serialization/sectionAdapters";
// import { storageService } from "@/services/storageService"; // No se utiliza en este archivo

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
      type: section.type as SectionType, // Conversión segura ya que validamos los tipos en Supabase
      title: section.title || "",
      description: section.description || undefined,
      data: section.data as Section['data'] || {}
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
// Definición simplificada para los datos de localStorage
interface LocalStorageBoard {
  name: string;
  sections: unknown[];
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  userId?: string;
}

export function adaptLocalStorageBoardForDisplay(localData: unknown): DisplayBoard | null {
  if (!localData || typeof localData !== 'object' || !('name' in localData) || !('sections' in localData) || !Array.isArray((localData as {sections?: unknown[]}).sections)) {
    return null;
  }
  
  const typedData = localData as LocalStorageBoard;

  // Procesar todas las secciones para manejar correctamente las imágenes
  // Importamos el tipo Section desde donde esté definido pero hacemos una versión más amplia
  // para poder manejar datos que podrían no cumplir exactamente con la estructura requerida
  interface StorageSection {
    id: string;
    type: SectionType;
    title: string;
    description?: string;
    data?: {
      images?: string[];
      imageMetadata?: Record<string, unknown>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  const sectionsWithValidatedImages = typedData.sections.map((section: unknown) => {
    // Hacemos una validación de tipo en runtime
    const typedSection = section as StorageSection;
    // Crear una copia de la sección
    const processedSection = { ...typedSection } as StorageSection;
    
    // Procesar las imágenes si es una sección de tipo imageGallery
    if (typedSection.type === 'imageGallery' && typedSection.data?.images) {
      processedSection.data = { ...typedSection.data };
      
      // Verificar si las URLs de blob siguen siendo válidas
      processedSection.data.images = typedSection.data.images.map((imageUrl: string) => {
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
  // Convertimos explícitamente al tipo Section
  const processedSections = prepareForDisplay(sectionsWithValidatedImages.map(section => {
    return {
      id: section.id,
      type: section.type,
      title: section.title,
      description: section.description,
      data: section.data as Section['data']
    } as Section;
  }));

  return {
    name: typedData.name,
    sections: processedSections,
    createdAt: typedData.createdAt,
    updatedAt: typedData.updatedAt,
    isPublished: typedData.isPublished,
    userId: typedData.userId
  };
}
