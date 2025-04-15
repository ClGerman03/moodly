"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Trash2, Plus, Maximize2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { ImageMetadata } from "./types/bento";
import ImageDetailPopup from "../popups/ImageDetailPopup";

// Importaciones de dnd-kit solo para desktop
import {
  DndContext, 
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
 * implementado con dnd-kit para simplificar la lógica y mejorar la experiencia.
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
  // Estados básicos
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [touchedImage, setTouchedImage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  
  // Referencias
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileDevice(window.matchMedia('(pointer: coarse)').matches);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Configuración de sensores para dnd-kit (solo desktop)
  const sensors = useSensors(
    // Sensor de puntero optimizado para desktop
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,     // Iniciar arrastre después de 8px de movimiento
      }
    }),
    // Soporte para navegación por teclado
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  
  // Manejar inicio de arrastre
  const handleDragStart = (event: DragStartEvent) => {
    if (isLiveMode) return;
    
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  // Manejar fin de arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    if (isLiveMode) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Encontrar los índices
      const activeIndex = images.findIndex(url => `image-${url}` === active.id);
      const overIndex = images.findIndex(url => `image-${url}` === over.id);
      
      // Reorganizar el array usando la utilidad de dnd-kit
      const newImages = arrayMove(images, activeIndex, overIndex);
      
      // Notificar nuevo orden
      onReorder(newImages);
    }
    
    setActiveId(null);
  };
  
  // Manejar clic en imagen
  const handleImageClick = (index: number) => {
    if (isLiveMode) return;
    
    const imageUrl = images[index];
    
    // Comportamiento diferente para dispositivos táctiles vs. mouse
    if (isMobileDevice) {
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
  
  // Manejar botones de acción
  const handleExpandImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setIsDetailPopupOpen(true);
  };
  
  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove(index);
  };
  
  // Manejar archivos y subida de imágenes
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
      className="w-full p-4 rounded-xl bg-gray-50/50 transition-colors duration-300 overflow-hidden"
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
        {isMobileDevice ? (
          // Versión simplificada para móviles con botones en vez de arrastre
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => {
              const metadata = imageMetadata.get(url);
              
              return (
                <div 
                  key={`image-${url}-${index}`}
                  className={`relative group rounded-xl overflow-hidden shadow-sm bg-white h-60
                  transition-all duration-200`}
                  onClick={() => handleImageClick(index)}
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
                      <p className="text-sm text-white font-medium truncate">{metadata.title}</p>
                    </div>
                  )}
                  
                  {/* Controles para móvil - visibles al tocar */}
                  {!isLiveMode && touchedImage === url && (
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-full bg-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute top-2 right-2 flex gap-2">
                        {/* Botones para mover hacia arriba/abajo */}
                        <div className="flex flex-col gap-1">
                          <motion.button
                            className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleMoveUp(index, e)}
                            disabled={index === 0}
                            style={{ opacity: index === 0 ? 0.5 : 1 }}
                          >
                            <ArrowUp size={16} />
                          </motion.button>
                          
                          <motion.button
                            className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleMoveDown(index, e)}
                            disabled={index === images.length - 1}
                            style={{ opacity: index === images.length - 1 ? 0.5 : 1 }}
                          >
                            <ArrowDown size={16} />
                          </motion.button>
                        </div>
                        
                        {/* Botón para expandir */}
                        <motion.button
                          className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(index);
                            setIsDetailPopupOpen(true);
                          }}
                        >
                          <Maximize2 size={16} />
                        </motion.button>
                        
                        {/* Botón para eliminar */}
                        <motion.button
                          className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageRemove(index);
                          }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Versión completa con dnd-kit para desktop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={images.map(url => `image-${url}`)} 
              strategy={rectSortingStrategy}
            >
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((url, index) => {
                  const metadata = imageMetadata.get(url);
                  const itemId = `image-${url}`;
                  
                  return (
                    <SortableImageItem
                      key={itemId}
                      id={itemId}
                      url={url}
                      index={index}
                      metadata={metadata}
                      isLiveMode={isLiveMode}
                      isHovered={hoveredImage === url}
                      isTouched={touchedImage === url}
                      onHover={setHoveredImage}
                      onClick={() => handleImageClick(index)}
                      onRemove={() => onImageRemove(index)}
                      onExpand={() => {
                        setSelectedImageIndex(index);
                        setIsDetailPopupOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </SortableContext>
            
            {/* Overlay de arrastre */}
            <DragOverlay adjustScale style={{ transformOrigin: '0 0' }}>
              {activeId ? (
                <DraggingImageItem 
                  url={activeId.replace('image-', '')}
                  metadata={imageMetadata.get(activeId.replace('image-', ''))} 
                />
              ) : null}
            </DragOverlay>
          </DndContext>
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
        
        {/* Botón para agregar más imágenes */}
        {!isLiveMode && (
          <motion.button
            className="mt-4 flex items-center justify-center w-full h-14 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 transition-all duration-200"
            whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={20} className="mr-2" />
            Agregar imágenes
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Componente para cada imagen sortable
const SortableImageItem = ({ 
  id, 
  url, 
  index, 
  metadata, 
  isLiveMode, 
  isHovered, 
  isTouched, 
  onHover, 
  onClick, 
  onRemove, 
  onExpand 
}: { 
  id: string; 
  url: string; 
  index: number; 
  metadata?: ImageMetadata; 
  isLiveMode: boolean; 
  isHovered: boolean; 
  isTouched: boolean; 
  onHover: (url: string | null) => void; 
  onClick: () => void; 
  onRemove: () => void; 
  onExpand: () => void;
}) => {
  // Usar el hook sortable de dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isLiveMode,
    // Mejorar la experiencia táctil
    animateLayoutChanges: () => false, // Evita animaciones que puedan afectar el rendimiento
  });
  
  // Aplicar estilos de transformación con la utilidad de dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    touchAction: 'none', // Prevenir scroll mientras se arrastra
  };
  
  // Detener propagación para botones
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };
  
  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden shadow-sm bg-white h-60
                transition-all duration-200 ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : 'opacity-100'}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay: index * 0.05 }}
      onMouseEnter={() => onHover(url)}
      onMouseLeave={() => onHover(null)}
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
          <p className="text-sm text-white font-medium truncate">{metadata.title}</p>
        </div>
      )}
      
      {/* Controles - Solo visibles al hacer hover o tocar en móvil */}
      {!isLiveMode && (isHovered || isTouched) && (
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-2 right-2 flex gap-2">
            {/* Botón de arrastre visible en todos los dispositivos */}
            <motion.button
              className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full cursor-grab active:cursor-grabbing touch-manipulation"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              whileTap={{ scale: 0.9 }}
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                // Prevenir comportamiento por defecto en móviles que pueda interferir
                e.stopPropagation();
              }}
              style={{ touchAction: 'none' }} // Crucial para dispositivos táctiles
            >
              <GripVertical size={16} />
            </motion.button>
            
            {/* Botón para expandir */}
            <motion.button
              className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleButtonClick(e, onExpand)}
            >
              <Maximize2 size={16} />
            </motion.button>
            
            {/* Botón para eliminar */}
            <motion.button
              className="p-2 bg-gray-800/80 shadow-sm text-white rounded-full"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleButtonClick(e, onRemove)}
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Componente para la vista de arrastre
const DraggingImageItem = ({ 
  url, 
  metadata 
}: { 
  url: string; 
  metadata?: ImageMetadata;
}) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg bg-white h-60 w-72 opacity-90 scale-95 rotate-1">
      <div className="h-full w-full">
        <Image
          src={url}
          fill
          alt={metadata?.title || 'Imagen'}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
        />
      </div>
      {metadata?.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <p className="text-sm text-white font-medium truncate">{metadata.title}</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallerySection;
