import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { storageService } from "@/services/storageService";
import { toast } from "react-hot-toast";

interface UseImageUploadOptions {
  isLiveMode: boolean;
  onImagesAdd: (newImages: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  boardId?: string; // ID del tablero actual, puede ser indefinido para nuevos tableros
}

/**
 * Hook personalizado para manejar la carga de imágenes
 */
export const useImageUpload = ({ isLiveMode, onImagesAdd, fileInputRef, boardId }: UseImageUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Procesa archivos seleccionados, los sube a Supabase Storage y devuelve las URLs permanentes
   */
  const handleFiles = useCallback(async (files: FileList) => {
    if (isLiveMode) return;
    
    setIsUploading(true);
    const uploadingToast = toast.loading("Subiendo imágenes...");
    
    // Si no hay boardId (tablero nuevo), generamos un ID temporal
    const targetBoardId = boardId || `temp-${uuidv4()}`;
    
    try {
      // Crear un array de promesas para subir todas las imágenes en paralelo
      const uploadPromises = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(async (file) => {
          // Primero creamos una URL blob temporal para mostrar inmediatamente
          const tempBlobUrl = URL.createObjectURL(file);
          
          try {
            // Subir directamente el archivo a Supabase Storage
            const { data: uploadResult, error } = await storageService.uploadImageFile(
              file, 
              targetBoardId
            );
            
            if (error) throw error;
            
            // Liberar el objeto URL temporal
            URL.revokeObjectURL(tempBlobUrl);
            
            // Verificar que uploadResult no sea null antes de acceder a la URL
            return uploadResult?.url || null;
          } catch (error) {
            console.error("Error subiendo imagen:", error);
            // En caso de error, devolvemos la URL temporal como fallback
            return tempBlobUrl;
          }
        });
      
      // Esperar a que todas las subidas terminen
      const uploadedImageUrls = await Promise.all(uploadPromises);
      
      // Filtrar solo las URLs válidas
      const validImageUrls = uploadedImageUrls.filter(url => url) as string[];
      
      if (validImageUrls.length > 0) {
        // Notificar al componente padre con las nuevas URLs
        onImagesAdd(validImageUrls);
        toast.success(`${validImageUrls.length} imágenes subidas`, { id: uploadingToast });
      } else {
        toast.error("No se pudieron subir las imágenes", { id: uploadingToast });
      }
    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      toast.error(`Error al subir imágenes: ${error instanceof Error ? error.message : "Error desconocido"}`, { id: uploadingToast });
    } finally {
      setIsUploading(false);
      
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isLiveMode, onImagesAdd, fileInputRef, boardId]);
  
  /**
   * Maneja el evento de soltar archivos (drag & drop)
   */
  const handleDropFiles = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (isLiveMode) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [isLiveMode, handleFiles]);
  
  /**
   * Maneja el cambio en el input de tipo file
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);
  
  /**
   * Activa el diálogo de selección de archivos
   */
  const triggerFileDialog = useCallback(() => {
    if (isUploading) {
      toast.error("Espera a que termine la subida actual");
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileInputRef, isUploading]);
  
  return {
    handleFiles,
    handleDropFiles,
    handleFileInputChange,
    triggerFileDialog,
    isUploading
  };
};
