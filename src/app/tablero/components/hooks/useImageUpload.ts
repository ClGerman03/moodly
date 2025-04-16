import { useCallback } from "react";

interface UseImageUploadOptions {
  isLiveMode: boolean;
  onImagesAdd: (newImages: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Hook personalizado para manejar la carga de imágenes
 */
export const useImageUpload = ({ isLiveMode, onImagesAdd, fileInputRef }: UseImageUploadOptions) => {
  /**
   * Procesa archivos seleccionados y los convierte en URLs de objeto
   */
  const handleFiles = useCallback((files: FileList) => {
    if (isLiveMode) return;
    
    const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        newImages.push(objectUrl);
      }
    });
    
    if (newImages.length > 0) {
      onImagesAdd(newImages);
    }
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isLiveMode, onImagesAdd, fileInputRef]);
  
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileInputRef]);
  
  return {
    handleFiles,
    handleDropFiles,
    handleFileInputChange,
    triggerFileDialog
  };
};
