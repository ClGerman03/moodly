/**
 * Servicio para gestionar el almacenamiento de archivos en Supabase Storage
 * 
 * Este servicio proporciona métodos para subir, recuperar y eliminar archivos,
 * con un enfoque especial en el manejo de imágenes para los tableros.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Nombre del bucket para almacenar las imágenes de los tableros
const BOARDS_BUCKET = 'board-images';

/**
 * Servicio para gestionar el almacenamiento de archivos en Supabase Storage
 */
export const storageService = {
  /**
   * Inicializa el bucket si no existe - Versión simplificada
   * @returns Verdadero si podemos proceder
   */
  async initBucket(): Promise<boolean> {
    try {
      // Asumimos que el bucket existe y está configurado correctamente
      // Esta es una versión simplificada que evita la verificación que podría estar fallando
      console.log(`[Storage] Usando bucket "${BOARDS_BUCKET}" sin verificar existencia previa`);
      
      // Intentamos listar el contenido del bucket para verificar acceso
      const { data, error } = await supabase.storage
        .from(BOARDS_BUCKET)
        .list();
      
      if (error) {
        console.error(`[Storage] Error al acceder al bucket "${BOARDS_BUCKET}":`, error);
        return false;
      }
      
      console.log(`[Storage] Acceso confirmado al bucket "${BOARDS_BUCKET}", elementos: ${data?.length || 0}`);
      return true;
    } catch (error) {
      console.error('[Storage] Error al inicializar storage:', error);
      return false;
    }
  },

  /**
   * Sube un archivo de imagen directamente a Supabase Storage
   * @param file - Archivo de imagen a subir
   * @param boardId - ID del tablero o identificador temporal
   * @returns Objeto con la URL pública de la imagen o un error
   */
  async uploadImageFile(
    file: File, 
    boardId: string
  ): Promise<{ data: { url: string } | null, error: Error | null }> {
    try {
      // Usar enfoque simplificado para bucket
      console.log(`[Storage] Intentando subir imagen para el tablero: ${boardId}`);
      const canProceed = await this.initBucket();
      if (!canProceed) {
        throw new Error('No se pudo acceder al almacenamiento para subir imágenes');
      }
      
      // Verificar que el archivo es válido
      if (!file || file.size === 0) {
        throw new Error('El archivo no es válido o está vacío');
      }
      
      // Generar un nombre de archivo único
      const fileExtension = this.getFileExtensionFromMimeType(file.type);
      const fileName = `${boardId.replace(/[^a-zA-Z0-9-_]/g, '_')}/${uuidv4()}${fileExtension}`;
      
      console.log(`[Storage] Subiendo imagen: ${fileName} (${Math.round(file.size/1024)}KB, ${file.type})`);
      
      // Subir el archivo con manejo explícito de errores
      const uploadResult = await supabase.storage
        .from(BOARDS_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true  // Cambiado a true para evitar conflictos
        });
      
      if (uploadResult.error) {
        console.error('[Storage] Error al subir:', uploadResult.error);
        throw new Error(`Error al subir imagen: ${uploadResult.error.message}`);
      }
      
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(BOARDS_BUCKET)
        .getPublicUrl(fileName);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }
      
      console.log('[Storage] Imagen subida con éxito:', publicUrlData.publicUrl.substring(0, 60) + '...');
      
      return { 
        data: { url: publicUrlData.publicUrl }, 
        error: null 
      };
    } catch (error) {
      console.error('[Storage] Error al subir imagen:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Error desconocido al subir la imagen') 
      };
    }
  },

  /**
   * Obtiene la extensión de archivo basada en el tipo MIME
   * @param mimeType - Tipo MIME del archivo
   * @returns Extensión de archivo con punto (ej: ".jpg", ".png")
   */
  getFileExtensionFromMimeType(mimeType: string): string {
    // Mapeo de tipos MIME a extensiones
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    };
    
    return mimeToExt[mimeType] || '.jpg'; // .jpg como fallback
  },

  /**
   * Sube una imagen desde una URL de blob a Supabase Storage
   * @param blobUrl - URL del blob de la imagen
   * @param boardId - ID del tablero al que pertenece la imagen (para organización)
   * @returns URL pública de la imagen en Supabase Storage, o null si falló
   */
  async uploadImageFromBlobUrl(blobUrl: string, boardId: string): Promise<string | null> {
    try {
      // Verificar si ya es una URL de Supabase Storage
      if (this.isStorageUrl(blobUrl)) {
        console.log(`[Storage] URL ya existe en Supabase Storage: ${blobUrl.substring(0, 40)}...`);
        return blobUrl; // Ya está en Storage, no es necesario subirla de nuevo
      }

      // Verificar que es una URL de blob válida
      if (!blobUrl.startsWith('blob:')) {
        console.log(`[Storage] No es una URL de blob, devolviendo URL original: ${blobUrl.substring(0, 40)}...`);
        return blobUrl; // No es un blob, podría ser una URL externa, devolvemos como está
      }

      // Iniciamos el bucket si es necesario
      const bucketInitialized = await this.initBucket();
      if (!bucketInitialized) {
        console.error('[Storage] No se pudo inicializar el bucket');
        throw new Error('No se pudo inicializar el bucket para almacenar imágenes');
      }
      
      // Obtener el blob desde la URL
      console.log(`[Storage] Obteniendo blob desde URL: ${blobUrl.substring(0, 40)}...`);
      const response = await fetch(blobUrl);
      if (!response.ok) throw new Error(`Error obteniendo el blob: ${response.statusText}`);
      
      const blob = await response.blob();
      
      // Verificar que el blob es válido
      if (!blob || blob.size === 0) {
        console.error('[Storage] Blob inválido o vacío');
        throw new Error('El blob obtenido no es válido o está vacío');
      }
      
      // Generar un nombre de archivo único
      const fileExtension = this.getFileExtensionFromBlob(blob);
      const fileName = `${boardId}/${uuidv4()}${fileExtension}`;
      
      console.log(`[Storage] Subiendo imagen a Supabase Storage: ${fileName}`);
      
      // Subir el archivo a Supabase Storage
      const { error } = await supabase.storage
        .from(BOARDS_BUCKET)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obtener la URL pública
      const { data: publicUrlData } = supabase.storage
        .from(BOARDS_BUCKET)
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }
      
      console.log(`[Storage] Imagen subida exitosamente. URL: ${publicUrlData.publicUrl.substring(0, 40)}...`);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('[Storage] Error crítico subiendo imagen:', error);
      // En lugar de devolver silenciosamente la URL original, lanzamos el error para 
      // que pueda ser manejado por el llamador
      throw new Error(`Error al subir imagen a Supabase Storage: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  /**
   * Procesa todas las imágenes de tipo blob en una sección y las sube a Supabase Storage
   * @param section - Sección que contiene imágenes a procesar
   * @param boardId - ID del tablero al que pertenece la sección
   * @returns La sección con las URLs de imágenes actualizadas
   */
  async processSectionImages(section: { type?: string; data?: { images?: string[]; imageMetadata?: Record<string, unknown> } }, boardId: string): Promise<typeof section> {
    // Si no es una sección de tipo imageGallery, no hay que procesar
    if (!section || section.type !== 'imageGallery' || !section.data?.images) {
      return section;
    }

    console.log(`[Storage] Procesando imágenes para sección tipo ${section.type} del tablero ${boardId}`);
    console.log(`[Storage] Total imágenes a procesar: ${section.data.images.length}`);

    const updatedSection = { ...section };
    const updatedImages = [...(section.data.images || [])];
    const updatedMetadata = { ...(section.data.imageMetadata || {}) };
    
    // Procesamos cada imagen
    const processingErrors: string[] = [];
    for (let i = 0; i < updatedImages.length; i++) {
      const imageUrl = updatedImages[i];
      
      // Si es una URL blob, la procesamos
      if (imageUrl.startsWith('blob:')) {
        try {
          console.log(`[Storage] Procesando imagen ${i+1}/${updatedImages.length}: ${imageUrl.substring(0, 40)}...`);
          const newUrl = await this.uploadImageFromBlobUrl(imageUrl, boardId);
          
          if (newUrl && newUrl !== imageUrl) {
            console.log(`[Storage] Imagen procesada exitosamente, nueva URL: ${newUrl.substring(0, 40)}...`);
            
            // Actualizar la URL en la lista de imágenes
            updatedImages[i] = newUrl;
            
            // Actualizar la URL en los metadatos si existe
            if (updatedMetadata[imageUrl]) {
              updatedMetadata[newUrl] = updatedMetadata[imageUrl];
              delete updatedMetadata[imageUrl];
            }
          } else {
            throw new Error("La URL procesada no es válida o no fue transformada");
          }
        } catch (error) {
          // Registramos el error pero continuamos con las demás imágenes
          const errorMessage = `Error procesando imagen ${i+1}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          console.error(`[Storage] ${errorMessage}`);
          processingErrors.push(errorMessage);
          
          // Eliminamos la imagen problemática para evitar referencias inválidas
          // (Podríamos también reemplazarla con una imagen de placeholder)
          updatedImages.splice(i, 1);
          i--; // Ajustamos el índice ya que eliminamos un elemento
        }
      } else {
        console.log(`[Storage] Imagen ${i+1} no es blob URL, omitiendo: ${imageUrl.substring(0, 40)}...`);
      }
    }
    
    // Si hubo errores durante el procesamiento, los agregamos a los metadatos
    // para poder mostrar mensajes adecuados al usuario
    if (processingErrors.length > 0) {
      console.warn(`[Storage] Completado con ${processingErrors.length} errores`);
      updatedMetadata['processingErrors'] = processingErrors;
    } else {
      console.log(`[Storage] Todas las imágenes procesadas exitosamente`);
    }
    
    // Actualizar la sección con las nuevas URLs
    updatedSection.data = {
      ...updatedSection.data,
      images: updatedImages,
      imageMetadata: updatedMetadata
    };
    
    return updatedSection;
  },

  /**
   * Obtiene la extensión de archivo a partir de un objeto Blob
   * @param blob - Objeto Blob
   * @returns Extensión de archivo con punto (ej: ".jpg", ".png")
   */
  getFileExtensionFromBlob(blob: Blob): string {
    // Mapeo de tipos MIME a extensiones
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    };
    
    return mimeToExt[blob.type] || '.jpg'; // .jpg como fallback
  },

  /**
   * Elimina una imagen de Supabase Storage
   * @param url - URL pública de la imagen
   * @returns Verdadero si se eliminó correctamente
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      // Extraer el path del archivo de la URL
      const path = this.getPathFromUrl(url);
      if (!path) return false;
      
      const { error } = await supabase.storage
        .from(BOARDS_BUCKET)
        .remove([path]);
      
      return !error;
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  },

  /**
   * Extrae el path del archivo de una URL pública de Supabase Storage
   * @param url - URL pública
   * @returns Path del archivo
   */
  getPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Buscar el índice donde aparece el nombre del bucket
      const bucketIndex = pathParts.findIndex(part => part === BOARDS_BUCKET);
      
      if (bucketIndex === -1) return null;
      
      // Extraer la parte del path después del bucket
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch (error) {
      console.error('Error extrayendo path de URL:', error);
      return null;
    }
  },

  /**
   * Comprueba si una URL es una URL de Storage de Supabase
   * @param url - URL a comprobar
   * @returns Verdadero si es una URL de Storage
   */
  isStorageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes(BOARDS_BUCKET);
    } catch {
      return false;
    }
  }
};
