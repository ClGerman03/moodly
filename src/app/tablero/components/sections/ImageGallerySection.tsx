"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { ImageMetadata } from "./gallery/types";
import ImageDetailPopup from "../popups/ImageDetailPopup";

// Importación de hooks personalizados
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useImageUpload } from "../hooks/useImageUpload";

// Importación de componentes
import MobileGallery from "./gallery/MobileGallery";
import DesktopGallery from "./gallery/DesktopGallery";
import AddImageButton from "./gallery/AddImageButton";

interface ImageGallerySectionProps {
  images: string[];
  imageMetadata?: Map<string, ImageMetadata>;
  onImagesAdd: (newImages: string[]) => void;
  onImageRemove: (index: number) => void;
  onImageMetadataChange?: (imageUrl: string, metadata: ImageMetadata) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
  onReorder?: (newImages: string[]) => void;
}

/**
 * Componente de galería de imágenes con funcionalidad de arrastre y organización
 */
const ImageGallerySection: React.FC<ImageGallerySectionProps> = ({
  images,
  imageMetadata = new Map(),
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = () => {}
}) => {
  // Detección de dispositivo (móvil vs desktop)
  const isMobileDevice = useDeviceDetection();

  // Estados básicos
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [touchedImage, setTouchedImage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  
  // Gestión de carga de imágenes
  const { 
    handleDropFiles, 
    handleFileInputChange, 
    triggerFileDialog 
  } = useImageUpload({ 
    isLiveMode, 
    onImagesAdd, 
    fileInputRef 
  });
  
  // Manejadores de eventos para ambas vistas
  
  // Manejar clic en imagen
  const handleImageClick = (index: number) => {
    if (isLiveMode) return;
    
    const imageUrl = images[index];
    
    // Comportamiento diferente para dispositivos táctiles vs. mouse
    if (isMobileDevice) {
      // En dispositivos móviles, solo alternamos el estado de selección
      // para mostrar/ocultar las opciones. Nunca abrimos el popup directamente.
      setTouchedImage(touchedImage === imageUrl ? null : imageUrl);
    } else {
      // En dispositivos no táctiles, abrir directamente el popup
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Drag and drop en desktop
  const handleDragStart = (event: DragStartEvent) => {
    if (isLiveMode) return;
    
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    if (isLiveMode) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Encontrar los índices
      const activeIndex = images.findIndex(url => `image-${url}` === active.id);
      const overIndex = images.findIndex(url => `image-${url}` === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        // Usar función de reordenamiento proporcionada por el padre
        onReorder([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(0, overIndex).concat(images[activeIndex]).concat([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(overIndex)));
      }
    }
    
    setActiveId(null);
  };
  
  // Mover imagen hacia arriba (para dispositivos móviles)
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      const newImages = [...images];
      // Intercambiar con la imagen anterior
      [newImages[index-1], newImages[index]] = [newImages[index], newImages[index-1]];
      onReorder(newImages);
    }
  };
  
  // Mover imagen hacia abajo (para dispositivos móviles)
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < images.length - 1) {
      const newImages = [...images];
      // Intercambiar con la imagen siguiente
      [newImages[index], newImages[index+1]] = [newImages[index+1], newImages[index]];
      onReorder(newImages);
    }
  };
  
  // Expandir imagen
  const handleImageExpand = (index: number, e?: React.MouseEvent) => {
    // Asegurarnos de detener la propagación del evento
    if (e) {
      e.stopPropagation();
      
      // En dispositivos móviles, sólo deberíamos abrir el popup
      // cuando el evento proviene explícitamente del botón de expandir
      // y no del evento de click en la imagen
      const isFromExpandButton = 
        e.currentTarget && 
        ((e.currentTarget as HTMLElement).classList.contains('bg-gray-800/90') ||
         (e.currentTarget as HTMLElement).classList.contains('bg-red-500/90'));
      
      // Solo abrimos el popup si:
      // 1. Estamos en desktop (no es móvil)
      // 2. O estamos en móvil pero el click vino del botón expandir específicamente
      if (!isMobileDevice || isFromExpandButton) {
        setSelectedImageIndex(index);
        setIsDetailPopupOpen(true);
      }
    } else if (!isMobileDevice) {
      // Si no hay evento (e) y no estamos en móvil, procedemos normalmente
      // (esto puede ocurrir en algunos casos programáticos)
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Eliminar imagen
  const handleImageRemove = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onImageRemove(index);
  };
  
  return (
    <motion.div
      className="w-full p-4 rounded-xl bg-gray-50/50 transition-colors duration-300 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div 
        className="relative w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFiles}
      >
        {/* Renderizado condicional basado en tipo de dispositivo */}
        {isMobileDevice ? (
          <MobileGallery
            images={images}
            imageMetadata={imageMetadata}
            hoveredImage={hoveredImage}
            touchedImage={touchedImage}
            isLiveMode={isLiveMode}
            onImageClick={handleImageClick}
            onHover={setHoveredImage}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onImageExpand={handleImageExpand}
            onImageRemove={handleImageRemove}
          />
        ) : (
          <DesktopGallery
            images={images}
            imageMetadata={imageMetadata}
            hoveredImage={hoveredImage}
            touchedImage={touchedImage}
            activeId={activeId}
            isLiveMode={isLiveMode}
            onImageClick={handleImageClick}
            onHover={setHoveredImage}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onImageRemove={handleImageRemove}
            onImageExpand={handleImageExpand}
          />
        )}

        {/* Popup para detalles de imagen */}
        <AnimatePresence>
          {isDetailPopupOpen && selectedImageIndex !== null && (
            <ImageDetailPopup
              isOpen={isDetailPopupOpen}
              imageUrl={images[selectedImageIndex]}
              initialTitle={imageMetadata.get(images[selectedImageIndex])?.title || ''}
              initialDescription={imageMetadata.get(images[selectedImageIndex])?.description || ''}
              onClose={() => {
                setIsDetailPopupOpen(false);
                setSelectedImageIndex(null);
              }}
              onSave={(title, description) => {
                if (selectedImageIndex !== null) {
                  onImageMetadataChange(images[selectedImageIndex], { title, description });
                }
              }}
              isLiveMode={isLiveMode}
            />
          )}
        </AnimatePresence>
        
        {/* Botón para agregar más imágenes y input file oculto */}
        {!isLiveMode && (
          <>
            <AddImageButton onClick={triggerFileDialog} />
            
            {/* Input invisible para selección de archivos */}
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              ref={fileInputRef}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ImageGallerySection;
