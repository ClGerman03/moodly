"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { ImageMetadata } from "./gallery/types";
import ImageDetailPopup from "../popups/ImageDetailPopup";

// Custom hooks import
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useImageUpload } from "../hooks/useImageUpload";
import { useImageMetadata } from "../../hooks/useImageMetadata";

// Components import
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
  boardId?: string;
}

/**
 * Image gallery component with drag and organization functionality
 */
const ImageGallerySection: React.FC<ImageGallerySectionProps> = ({
  images,
  imageMetadata = new Map(),
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = () => {},
  boardId
}) => {
  // Device detection (mobile vs desktop)
  const isMobileDevice = useDeviceDetection();

  // Basic states
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [touchedImage, setTouchedImage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  
  // Estado para mantener los metadatos actualizados mientras el popup está abierto
  const [currentEditingMetadata, setCurrentEditingMetadata] = useState<ImageMetadata | null>(null);

  // Usar nuestro hook personalizado para gestionar los metadatos
  const { metadata, updateMetadata, getMetadata, removeMetadata } = useImageMetadata({
    initialMetadata: imageMetadata,
    onMetadataChange: onImageMetadataChange
  });

  // Image loading management
  const { 
    handleDropFiles, 
    handleFileInputChange, 
    triggerFileDialog,
    isUploading
  } = useImageUpload({ 
    isLiveMode, 
    onImagesAdd, 
    fileInputRef,
    boardId 
  });
  
  // Limpiar metadatos de imágenes eliminadas
  useEffect(() => {
    // Solo ejecutar esta limpieza cuando cambia la lista de imágenes
    const currentUrls = new Set(images);
    metadata.forEach((_, url) => {
      if (!currentUrls.has(url)) {
        removeMetadata(url);
      }
    });
  }, [images, metadata, removeMetadata]);
  
  // Event handlers for both views
  
  // Manejar la apertura del popup de detalles
  const handleOpenDetailPopup = (index: number) => {
    const imageUrl = images[index];
    const currentMetadata = getMetadata(imageUrl);
    
    // Almacenar los metadatos actuales para asegurar que persistan
    setCurrentEditingMetadata(currentMetadata);
    setSelectedImageIndex(index);
    setIsDetailPopupOpen(true);
  };

  // Manejar el cierre del popup de detalles
  const handleCloseDetailPopup = () => {
    // Limpiar el estado para evitar problemas de persistencia
    setCurrentEditingMetadata(null);
    setIsDetailPopupOpen(false);
    setSelectedImageIndex(null);
  };
  
  // Handle image click
  const handleImageClick = (index: number) => {
    if (isLiveMode) return;
    
    const imageUrl = images[index];
    
    // Different behavior for touch devices vs. mouse
    if (isMobileDevice) {
      // On mobile devices, we only toggle the selection state
      // to show/hide options. We never open the popup directly.
      setTouchedImage(touchedImage === imageUrl ? null : imageUrl);
    } else {
      // On non-touch devices, open the popup directly
      handleOpenDetailPopup(index);
    }
  };
  
  // Drag and drop on desktop
  const handleDragStart = (event: DragStartEvent) => {
    if (isLiveMode) return;
    
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    if (isLiveMode) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find indices
      const activeIndex = images.findIndex(url => `image-${url}` === active.id);
      const overIndex = images.findIndex(url => `image-${url}` === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        // Use reordering function provided by parent
        onReorder([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(0, overIndex).concat(images[activeIndex]).concat([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(overIndex)));
      }
    }
    
    setActiveId(null);
  };
  
  // Move image up (for mobile devices)
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      const newImages = [...images];
      // Swap with previous image
      [newImages[index-1], newImages[index]] = [newImages[index], newImages[index-1]];
      onReorder(newImages);
    }
  };
  
  // Move image down (for mobile devices)
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < images.length - 1) {
      const newImages = [...images];
      // Swap with next image
      [newImages[index], newImages[index+1]] = [newImages[index+1], newImages[index]];
      onReorder(newImages);
    }
  };
  
  // Expand image - usar el nuevo mecanismo
  const handleImageExpand = (index: number, e?: React.MouseEvent) => {
    // Make sure to stop event propagation
    if (e) {
      e.stopPropagation();
      
      // On mobile devices, we should only open the popup
      // when the event comes explicitly from the expand button
      // and not from the click event on the image
      const isFromExpandButton = 
        e.currentTarget && 
        ((e.currentTarget as HTMLElement).classList.contains('bg-gray-800/90') ||
         (e.currentTarget as HTMLElement).classList.contains('bg-red-500/90'));
      
      // We only open the popup if:
      // 1. We are on desktop (not mobile)
      // 2. Or we are on mobile but the click came from the expand button specifically
      if (!isMobileDevice || isFromExpandButton) {
        handleOpenDetailPopup(index);
      }
    } else if (!isMobileDevice) {
      // If there is no event (e) and we are not on mobile, we proceed normally
      // (this can occur in some programmatic cases)
      handleOpenDetailPopup(index);
    }
  };
  
  // Remove image
  const handleImageRemove = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Eliminar metadatos asociados a la imagen
    const imageUrl = images[index];
    removeMetadata(imageUrl);
    
    // Propagar eliminación al componente padre
    onImageRemove(index);
  };
  
  // Handle metadata updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMetadataUpdate = (imageUrl: string, metadata: ImageMetadata) => {
    // Update the local cache
    updateMetadata(imageUrl, metadata);
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
        {/* Conditional rendering based on device type */}
        {isMobileDevice ? (
          <MobileGallery
            images={images}
            imageMetadata={metadata}
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
            imageMetadata={metadata}
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

        {/* Popup for image details */}
        <AnimatePresence>
          {isDetailPopupOpen && selectedImageIndex !== null && (
            <ImageDetailPopup
              key={`detail-${images[selectedImageIndex]}-${Date.now()}`} // Forzar remontaje completo cada vez
              isOpen={isDetailPopupOpen}
              imageUrl={images[selectedImageIndex]}
              initialTitle={currentEditingMetadata?.title || ''}
              initialDescription={currentEditingMetadata?.description || ''}
              initialTags={currentEditingMetadata?.tags || []}
              onClose={handleCloseDetailPopup}
              onSave={(title, description, tags) => {
                if (selectedImageIndex !== null) {
                  const newMetadata = { title, description, tags };
                  updateMetadata(images[selectedImageIndex], newMetadata);
                  setCurrentEditingMetadata(newMetadata); // Actualizar metadatos actuales
                }
              }}
              isLiveMode={isLiveMode}
            />
          )}
        </AnimatePresence>
        
        {/* Button to add more images and hidden file input */}
        {!isLiveMode && (
          <>
            <AddImageButton 
              onClick={triggerFileDialog} 
              disabled={isUploading}
            />
            
            {/* Estado de carga */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30 rounded-xl z-10">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-lg">
                  <div className="w-6 h-6 border-2 border-t-gray-600 border-r-gray-600 border-b-gray-200 border-l-gray-200 rounded-full animate-spin mb-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Subiendo imágenes...</span>
                </div>
              </div>
            )}
            
            {/* Invisible input for file selection */}
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
