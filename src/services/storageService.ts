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
   * Inicializa el bucket si no existe
   * @returns Verdadero si se inicializó correctamente
   */
  async initBucket(): Promise<boolean> {
    try {
      // Verificar si el bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === BOARDS_BUCKET);
      
      if (!bucketExists) {
        // Crear el bucket si no existe
        const { error } = await supabase.storage.createBucket(BOARDS_BUCKET, {
          public: true, // Las imágenes serán públicas para que se puedan ver sin autenticación
        });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error inicializando bucket:', error);
      return false;
    }
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
      if (blobUrl.includes(BOARDS_BUCKET)) {
        return blobUrl; // Ya está en Storage, no es necesario subirla de nuevo
      }

      // Iniciamos el bucket si es necesario
      await this.initBucket();
      
      // Obtener el blob desde la URL
      const response = await fetch(blobUrl);
      if (!response.ok) throw new Error(`Error obteniendo el blob: ${response.statusText}`);
      
      const blob = await response.blob();
      
      // Generar un nombre de archivo único
      const fileExtension = this.getFileExtensionFromBlob(blob);
      const fileName = `${boardId}/${uuidv4()}${fileExtension}`;
      
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
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      // Si hay un error, devolvemos la URL original para mantener la compatibilidad
      return blobUrl; 
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

    const updatedSection = { ...section };
    const updatedImages = [...(section.data.images || [])];
    const updatedMetadata = { ...(section.data.imageMetadata || {}) };
    
    // Procesamos cada imagen
    for (let i = 0; i < updatedImages.length; i++) {
      const imageUrl = updatedImages[i];
      
      // Si es una URL blob, la procesamos
      if (imageUrl.startsWith('blob:')) {
        const newUrl = await this.uploadImageFromBlobUrl(imageUrl, boardId);
        
        if (newUrl && newUrl !== imageUrl) {
          // Actualizar la URL en la lista de imágenes
          updatedImages[i] = newUrl;
          
          // Actualizar la URL en los metadatos si existe
          if (updatedMetadata[imageUrl]) {
            updatedMetadata[newUrl] = updatedMetadata[imageUrl];
            delete updatedMetadata[imageUrl];
          }
        }
      }
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
