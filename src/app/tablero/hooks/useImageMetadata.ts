import { useState, useEffect, useCallback } from 'react';
import { ImageMetadata } from '../components/sections/gallery/types';

interface UseImageMetadataProps {
  initialMetadata?: Map<string, ImageMetadata>;
  onMetadataChange?: (imageUrl: string, metadata: ImageMetadata) => void;
}

/**
 * Hook personalizado para gestionar los metadatos de las imágenes
 * con persistencia garantizada entre interacciones.
 */
export function useImageMetadata({ 
  initialMetadata = new Map(), 
  onMetadataChange 
}: UseImageMetadataProps) {
  // Estado local para metadatos
  const [metadata, setMetadata] = useState<Map<string, ImageMetadata>>(new Map(initialMetadata));

  // Sincronizar estado cuando cambien los metadatos iniciales
  useEffect(() => {
    if (initialMetadata) {
      setMetadata(new Map(initialMetadata));
    }
  }, [initialMetadata]);

  /**
   * Actualiza los metadatos de una imagen específica y notifica al componente padre
   */
  const updateMetadata = useCallback((imageUrl: string, imageMetadata: ImageMetadata) => {
    setMetadata(prev => {
      const newMetadata = new Map(prev);
      newMetadata.set(imageUrl, imageMetadata);
      return newMetadata;
    });

    // Propagar cambios al componente padre
    if (onMetadataChange) {
      onMetadataChange(imageUrl, imageMetadata);
    }
  }, [onMetadataChange]);

  /**
   * Obtiene los metadatos de una imagen específica
   */
  const getMetadata = useCallback((imageUrl: string): ImageMetadata => {
    return metadata.get(imageUrl) || { title: '', description: '', tags: [] };
  }, [metadata]);

  /**
   * Elimina los metadatos de una imagen específica
   */
  const removeMetadata = useCallback((imageUrl: string) => {
    setMetadata(prev => {
      const newMetadata = new Map(prev);
      newMetadata.delete(imageUrl);
      return newMetadata;
    });
  }, []);

  return {
    metadata,
    updateMetadata,
    getMetadata,
    removeMetadata
  };
}
