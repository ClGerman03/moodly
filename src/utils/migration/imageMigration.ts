/**
 * Utilidades para la migración de imágenes de localStorage a Supabase Storage
 * 
 * Este archivo proporciona funciones para migrar imágenes de localStorage a Supabase Storage
 * y actualizar las referencias en los tableros.
 */

import { storageService } from "@/services/storageService";
import { boardService } from "@/services/boardService";
import { sectionService } from "@/services/sectionService";
import { toast } from "react-hot-toast";

/**
 * Migra todas las imágenes de un tablero desde blob URLs a Supabase Storage
 * @param slug - Slug del tablero
 * @returns Verdadero si la migración fue exitosa
 */
export async function migrateImagesForBoard(slug: string): Promise<boolean> {
  try {
    // Mostrar notificación de inicio
    const migrationToast = toast.loading("Migrating images to cloud storage...");
    
    // 1. Obtener el tablero desde Supabase o localStorage
    const board = await boardService.getBoardBySlug(slug);
    
    if (!board) {
      toast.error("Board not found");
      toast.dismiss(migrationToast);
      return false;
    }
    
    // 2. Obtener todas las secciones del tablero
    const sections = await sectionService.getSectionsByBoardId(board.id);
    
    if (!sections || sections.length === 0) {
      toast.error("No sections found for this board");
      toast.dismiss(migrationToast);
      return false;
    }
    
    // 3. Procesar cada sección y migrar las imágenes
    let hasChanges = false;
    const updatedSections = await Promise.all(sections.map(async (section) => {
      if (section.type !== 'imageGallery' || !section.data?.images) {
        return section;
      }
      
      const originalImages = section.data.images as string[];
      const imageMetadata = section.data.imageMetadata || {};
      
      // Procesar cada imagen
      const updatedImages: string[] = [];
      const updatedMetadata: Record<string, any> = {};
      
      for (const imageUrl of originalImages) {
        if (imageUrl.startsWith('blob:')) {
          // Es una URL de blob, migrar a Supabase Storage
          const newUrl = await storageService.uploadImageFromBlobUrl(imageUrl, board.id);
          
          if (newUrl && newUrl !== imageUrl) {
            updatedImages.push(newUrl);
            
            // Migrar los metadatos si existen
            if (imageMetadata[imageUrl]) {
              updatedMetadata[newUrl] = imageMetadata[imageUrl];
            }
            
            hasChanges = true;
          } else {
            // Si falló la migración, mantener la URL original
            updatedImages.push(imageUrl);
            if (imageMetadata[imageUrl]) {
              updatedMetadata[imageUrl] = imageMetadata[imageUrl];
            }
          }
        } else {
          // No es una URL de blob, mantenerla igual
          updatedImages.push(imageUrl);
          if (imageMetadata[imageUrl]) {
            updatedMetadata[imageUrl] = imageMetadata[imageUrl];
          }
        }
      }
      
      // Si hubo cambios, actualizar la sección
      if (hasChanges) {
        const updatedData = {
          ...section.data,
          images: updatedImages,
          imageMetadata: updatedMetadata
        };
        
        // Crear una copia de la sección con los datos actualizados
        return {
          ...section,
          data: updatedData
        };
      }
      
      return section;
    }));
    
    // Si hubo cambios, guardar las secciones actualizadas
    if (hasChanges) {
      // Convertir las secciones actualizadas al formato de la aplicación para guardarlas
      const sectionsForSaving = updatedSections.map(section => ({
        id: section.section_id,
        type: section.type,
        title: section.title || "",
        description: section.description || undefined,
        data: section.data
      }));
      
      await sectionService.saveSections(board.id, sectionsForSaving as any);
      
      toast.success("Images migrated successfully", { id: migrationToast });
      return true;
    } else {
      toast.success("No images needed migration", { id: migrationToast });
      return true;
    }
  } catch (error) {
    console.error("Error migrating images:", error);
    toast.error(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

/**
 * Migra todas las imágenes de todos los tableros del usuario
 * @param userId - ID del usuario
 * @returns Verdadero si la migración fue exitosa
 */
export async function migrateAllUserBoardImages(userId: string): Promise<boolean> {
  try {
    // Mostrar notificación de inicio
    const migrationToast = toast.loading("Migrating all board images...");
    
    // 1. Obtener todos los tableros del usuario
    const boards = await boardService.getBoardsByUser(userId);
    
    if (!boards || boards.length === 0) {
      toast.error("No boards found for this user");
      toast.dismiss(migrationToast);
      return false;
    }
    
    // 2. Migrar las imágenes de cada tablero
    let successCount = 0;
    let failureCount = 0;
    
    for (const board of boards) {
      try {
        const success = await migrateImagesForBoard(board.slug);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error migrating images for board ${board.name}:`, error);
        failureCount++;
      }
    }
    
    // 3. Mostrar resultado
    if (failureCount === 0) {
      toast.success(`Successfully migrated images for all ${successCount} boards`, { id: migrationToast });
      return true;
    } else {
      toast.error(`Migration completed with issues: ${successCount} successful, ${failureCount} failed`, { id: migrationToast });
      return false;
    }
  } catch (error) {
    console.error("Error migrating all board images:", error);
    toast.error(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}
