"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageDetailPopup from "../popups/ImageDetailPopup";
import Image from "next/image";
import { Trash2, Plus, Maximize2, GripVertical } from "lucide-react";
import { ImageMetadata } from "./types/bento";
import { useDraggableGrid } from "../../hooks/useDraggableGrid";

// Constantes para el grid
const COLUMNS = 1; // Simplificamos a un diseño de una columna
const MARGIN = 10;

interface SimpleBentoImageGridProps {
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
 * Versión simplificada del grid de imágenes que mantiene arrastre para ordenar
 * y hover para ver opciones.
 */
const SimpleBentoImageGrid: React.FC<SimpleBentoImageGridProps> = ({
  images,
  imageMetadata = new Map(),
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = () => {}
}) => {
  // Estados básicos
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  
  // Referencias
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Usar el hook de arrastre personalizado
  const {
    draggedIndex,
    dragOverIndex,
    touchedItem: touchedImage,
    setTouchedItem: setTouchedImage,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDragHandleTouchStart,
    handleDragHandleMouseDown,
    isDraggingHandle
  } = useDraggableGrid({
    isLiveMode,
    onReorder: (sourceIndex, targetIndex) => {
      // Crear un nuevo arreglo reordenado
      const newImages = [...images];
      const [movedImage] = newImages.splice(sourceIndex, 1);
      newImages.splice(targetIndex, 0, movedImage);
      
      // Notificar el nuevo orden
      onReorder(newImages);
    }
  });
  
  // Manejar clic en imagen
  const handleImageClick = (index: number) => {
    if (isLiveMode) return;
    
    const imageUrl = images[index];

    // Si estamos en dispositivo táctil, alternar la visualización de opciones
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (touchedImage === imageUrl) {
        // Si ya estaba seleccionada, abrir el popup
        setSelectedImageIndex(index);
        setIsDetailPopupOpen(true);
        setTouchedImage(null);
      } else {
        // Alternar el estado de tocado
        setTouchedImage(touchedImage === imageUrl ? null : imageUrl);
      }
    } else {
      // En dispositivos no táctiles, abrir directamente el popup
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Manejar guardado de metadatos de imagen
  const handleSaveMetadata = (title: string, description: string) => {
    if (selectedImageIndex === null) return;
    
    const imageUrl = images[selectedImageIndex];
    onImageMetadataChange(imageUrl, { title, description });
    setIsDetailPopupOpen(false);
  };
  
  // Manejar eliminación de imagen
  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiveMode) return;
    
    // Limpiar el estado de imagen tocada
    setTouchedImage(null);
    onImageRemove(index);
  };
  
  // Manejar la expansión de la imagen para ver detalles
  const handleExpandImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiveMode) return;
    
    // Abrir el popup directamente
    setSelectedImageIndex(index);
    setIsDetailPopupOpen(true);
    // Limpiar el estado de imagen tocada
    setTouchedImage(null);
  };
  
  // Manejar archivos nuevos
  const handleFiles = (files: FileList) => {
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
  };
  
  // Manejar archivos soltados en la zona
  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (isLiveMode) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  return (
    <motion.div
      className="w-full p-4 rounded-xl transition-colors duration-300 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div 
        ref={containerRef}
        className="relative w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFiles}
      >
        {/* Grid de imágenes */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => {
            const metadata = imageMetadata.get(url);
            
            return (
              <motion.div 
                key={`${url}-${index}`}
                data-index={index}
                className={`relative group rounded-xl overflow-hidden shadow-sm bg-white h-60 draggable-item
                          ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
                          ${dragOverIndex === index ? 'border-2 border-blue-500' : ''}
                          transition-all duration-200`}
                draggable={!isLiveMode && isDraggingHandle}
                onDragStart={(e) => handleDragStart(e, index, url)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleImageClick(index)}
                onTouchMove={(e) => handleTouchMove(index, e)}
                onTouchEnd={(e) => handleTouchEnd(index, e)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: draggedIndex === index ? 0.98 : 1,
                  zIndex: draggedIndex === index ? 50 : 1
                }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 300, 
                  delay: index * 0.05 
                }}
                onMouseEnter={() => setHoveredImage(url)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                {/* Imagen */}
                <div className="h-full w-full">
                  <Image
                    src={url}
                    fill
                    alt={metadata?.title || `Imagen ${index + 1}`}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  />
                </div>
                
                {/* Overlay para título - siempre visible */}
                {metadata?.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                    <h3 className="text-white text-sm font-medium truncate">
                      {metadata.title}
                    </h3>
                  </div>
                )}
                
                {/* Controles en hover o touch - ocultos en modo live */}
                {!isLiveMode && (
                  <AnimatePresence>
                    {(hoveredImage === url || touchedImage === url) && (
                      <motion.div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex gap-2">
                          {/* En dispositivos táctiles, mostramos botones específicos */}
                          {window.matchMedia('(pointer: coarse)').matches ? (
                            <>
                              {/* Botón para arrastrar en móvil */}
                              <motion.button
                                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full drag-handle"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                whileTap={{ scale: 0.9 }}
                                onTouchStart={(e) => {
                                  e.stopPropagation();
                                  handleDragHandleTouchStart(index, url, e);
                                  // Añadir retroalimentación visual inmediata
                                  e.currentTarget.classList.add('active-drag-handle');
                                }}
                              >
                                <GripVertical size={16} />
                              </motion.button>
                              
                              {/* Botón para expandir */}
                              <motion.button
                                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleExpandImage(index, e)}
                              >
                                <Maximize2 size={16} />
                              </motion.button>
                              
                              {/* Botón para eliminar */}
                              <motion.button
                                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleRemoveImage(index, e)}
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              {/* En escritorio, botón de agarre para iniciar arrastre */}
                              <motion.button
                                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full drag-handle"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                whileTap={{ scale: 0.9 }}
                                onMouseDown={(e) => {
                                  handleDragHandleMouseDown(index, e);
                                  // Encontrar el elemento padre y hacerlo arrastrable
                                  const parentItem = e.currentTarget.closest('.draggable-item');
                                  if (parentItem) {
                                    // Programáticamente empezar el arrastre después de un corto retraso
                                    setTimeout(() => {
                                      if (isDraggingHandle && parentItem instanceof HTMLElement) {
                                        try {
                                          parentItem.setAttribute('draggable', 'true');
                                          // Crear un evento de arrastre sintético
                                          const dragEvent = new MouseEvent('dragstart', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: window
                                          });
                                          parentItem.dispatchEvent(dragEvent);
                                        } catch (err) {
                                          console.error('Error al iniciar arrastre:', err);
                                        }
                                      }
                                    }, 0);
                                  }
                                }}
                              >
                                <GripVertical size={16} />
                              </motion.button>
                              
                              {/* Botón para eliminar */}
                              <motion.button
                                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleRemoveImage(index, e)}
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
          
          {/* Botón para agregar imágenes - oculto en modo live */}
          {!isLiveMode && (
            <motion.div
              className="h-60 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-gray-500">
                <Plus size={24} />
                <span className="mt-2 text-sm">Agregar imagen</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Input oculto para seleccionar archivos */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      
      {/* Popup de detalle de imagen */}
      <AnimatePresence mode="wait">
        {isDetailPopupOpen && selectedImageIndex !== null && (
          <ImageDetailPopup
            isOpen={isDetailPopupOpen}
            onClose={() => setIsDetailPopupOpen(false)}
            imageUrl={images[selectedImageIndex]}
            initialTitle={imageMetadata.get(images[selectedImageIndex])?.title || ""}
            initialDescription={imageMetadata.get(images[selectedImageIndex])?.description || ""}
            onSave={handleSaveMetadata}
            isLiveMode={isLiveMode}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SimpleBentoImageGrid;
