import { Section, SectionType } from "@/app/tablero/types";

/**
 * Utilidades para la serialización y deserialización de secciones de tablero
 * Cada tipo de sección tiene su propio adaptador que maneja las peculiaridades
 * de sus datos para garantizar que se puedan serializar/deserializar correctamente
 */

interface SectionAdapter {
  prepareForStorage: (section: Section) => Section;
  prepareForDisplay: (section: Section) => Section;
}

/**
 * Convierte un objeto Map a un objeto plano para serialización
 * @deprecated Esta función está reservada para uso futuro cuando se implemente
 * el manejo de Maps en toda la aplicación. Por ahora, usamos Object.fromEntries directamente.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapToObject<K extends string | number, V>(map: Map<K, V> | undefined): Record<string, V> | undefined {
  if (!map) return undefined;
  return Array.from(map.entries()).reduce((obj, [key, value]) => {
    obj[String(key)] = value;
    return obj;
  }, {} as Record<string, V>);
}

/**
 * Convierte un objeto plano de vuelta a un Map
 * @deprecated Esta función está reservada para uso futuro cuando se implemente
 * el manejo de Maps en toda la aplicación. Por ahora, usamos el constructor Map directamente.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function objectToMap<K extends string | number, V>(obj: Record<string, V> | undefined): Map<K, V> | undefined {
  if (!obj) return undefined;
  return new Map(Object.entries(obj).map(([k, v]) => [k as K, v]));
}

/**
 * Convierte URLs de blob a data URLs (para imágenes)
 * Nota: En una implementación real, esto sería asíncrono y usaría FileReader
 * Esta es una versión simplificada para demostración
 */
function processBlobUrls(url: string): string {
  // En un ambiente real, aquí convertiríamos blob URLs a data URLs
  // Para esta demo, simplemente pasamos la URL tal cual
  return url;
}

/**
 * Adaptadores específicos para cada tipo de sección
 */
const sectionAdapters: Record<SectionType, SectionAdapter> = {
  imageGallery: {
    prepareForStorage(section: Section): Section {
      const { data, ...rest } = section;
      if (!data) return section;

      // Convertir las URLs de blob a data URLs si es necesario
      const processedImages = data.images?.map(processBlobUrls) || [];

      // Asegurarse de que imageMetadata sea un objeto plano
      const imageMetadata = data.imageMetadata || {};

      return {
        ...rest,
        data: {
          ...data,
          images: processedImages,
          imageMetadata,
          // Agregar layouts por defecto para compatibilidad con BentoImageFeedback
          imageLayouts: Object.fromEntries(
            processedImages.map((_, index) => [index, 'square'])
          )
        }
      };
    },
    prepareForDisplay(section: Section): Section {
      const { data, ...rest } = section;
      if (!data) return section;

      return {
        ...rest,
        data: {
          ...data,
          imageMetadata: data.imageMetadata || {},
          imageLayouts: data.imageLayouts || {}
        }
      };
    }
  },
  
  palette: {
    prepareForStorage: (section: Section): Section => {
      console.log("Preparando sección palette para almacenamiento", section);
      // ColorPalette usa estructuras simples que serializan bien
      return section;
    },
    prepareForDisplay: (section: Section): Section => {
      console.log("Preparando sección palette para visualización", section);
      return section;
    }
  },
  
  links: {
    prepareForStorage: (section: Section): Section => {
      console.log("Preparando sección links para almacenamiento", section);
      // LinkSection usa estructuras simples que serializan bien
      return section;
    },
    prepareForDisplay: (section: Section): Section => {
      console.log("Preparando sección links para visualización", section);
      return section;
    }
  },
  
  typography: {
    prepareForStorage: (section: Section): Section => {
      console.log("Preparando sección typography para almacenamiento", section);
      const { data, ...rest } = section;
      if (!data) return section;
      
      // Asegurarnos de que se serialicen correctamente todas las propiedades importantes
      return {
        ...rest,
        data: {
          ...data,
          fonts: data.fonts || [],
          previewSize: data.previewSize || "md", // Asegurarnos de que previewSize se serialice
          previewText: data.previewText || "La tipografía es el arte y técnica de elegir y usar tipos." // Asegurarnos de que previewText se serialice
        }
      };
    },
    prepareForDisplay: (section: Section): Section => {
      console.log("Preparando sección typography para visualización", section);
      const { data, ...rest } = section;
      if (!data) return section;
      
      // Asegurarnos de que todas las propiedades estén presentes para su visualización
      return {
        ...rest,
        data: {
          ...data,
          fonts: data.fonts || [],
          previewSize: data.previewSize || "md", // Valor por defecto si no existe
          previewText: data.previewText || "La tipografía es el arte y técnica de elegir y usar tipos." // Valor por defecto si no existe
        }
      };
    }
  },
  
  text: {
    prepareForStorage: (section: Section): Section => {
      console.log("Preparando sección text para almacenamiento", section);
      const { data, ...rest } = section;
      if (!data) return section;
      
      // Asegurarnos de que textContent existe y tiene los campos necesarios
      const defaultTextContent = {
        title: "",
        subtitle: "",
        size: "medium" as const
      };
      
      return {
        ...rest,
        data: {
          ...data,
          textContent: data.textContent 
            ? {
                title: data.textContent.title || defaultTextContent.title,
                subtitle: data.textContent.subtitle || defaultTextContent.subtitle,
                size: data.textContent.size || defaultTextContent.size
              }
            : defaultTextContent
        }
      };
    },
    prepareForDisplay: (section: Section): Section => {
      console.log("Preparando sección text para visualización", section);
      const { data, ...rest } = section;
      if (!data) return section;
      
      // Asegurarnos de que textContent existe para la visualización
      const defaultTextContent = {
        title: "",
        subtitle: "",
        size: "medium" as const
      };
      
      return {
        ...rest,
        data: {
          ...data,
          textContent: data.textContent 
            ? {
                title: data.textContent.title || defaultTextContent.title,
                subtitle: data.textContent.subtitle || defaultTextContent.subtitle,
                size: data.textContent.size || defaultTextContent.size
              }
            : defaultTextContent
        }
      };
    }
  }
};

/**
 * Prepara todas las secciones para almacenamiento
 */
export const prepareForStorage = (sections: Section[]): Section[] => {
  console.log("Preparando todas las secciones para almacenamiento", sections);
  try {
    return sections.map(section => {
      const adapter = sectionAdapters[section.type];
      return adapter ? adapter.prepareForStorage(section) : section;
    });
  } catch (error) {
    console.error("Error preparando secciones para almacenamiento:", error);
    return sections; // Devolver original en caso de error
  }
};

/**
 * Prepara todas las secciones para visualización
 */
export const prepareForDisplay = (sections: Section[]): Section[] => {
  console.log("Preparando todas las secciones para visualización", sections);
  try {
    return sections.map(section => {
      const adapter = sectionAdapters[section.type];
      return adapter ? adapter.prepareForDisplay(section) : section;
    });
  } catch (error) {
    console.error("Error preparando secciones para visualización:", error);
    return sections; // Devolver original en caso de error
  }
};

/**
 * Utilidad para sanear cualquier objeto antes de serialización JSON
 */
export const sanitizeForJson = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Si es un array, procesamos cada elemento
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForJson(item));
  }
  
  // Si es un objeto, procesamos cada propiedad
  if (typeof data === 'object') {
    // Verificar si es una fecha
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Para cualquier otro objeto
    const result: Record<string, unknown> = {};
    const objData = data as Record<string, unknown>;
    
    // Iteramos sobre las propiedades usando Object.entries para mayor seguridad de tipos
    Object.entries(objData).forEach(([key, value]) => {
      // Ignorar funciones y símbolos
      if (typeof value !== 'function' && typeof value !== 'symbol') {
        result[key] = sanitizeForJson(value);
      }
    });
    
    return result;
  }
  
  // Para valores primitivos, simplemente los devolvemos tal cual
  return data;
};
