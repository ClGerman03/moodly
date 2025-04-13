"use client";

import { useState, ChangeEvent, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { Move } from "lucide-react";
import ImageDetailPopup from "../popups/ImageDetailPopup";

export type ImageLayout = "square" | "vertical" | "horizontal";

interface ImageMetadata {
  title?: string;
  description?: string;
}

interface BentoImageGridProps {
  images: string[];
  imageLayouts?: Map<number, ImageLayout>;
  imageMetadata?: Map<string, ImageMetadata>;
  onLayoutChange: (index: number, layout: ImageLayout) => void;
  onImagesAdd: (newImages: string[]) => void;
  onImageRemove: (index: number) => void;
  onImageMetadataChange?: (imageUrl: string, metadata: ImageMetadata) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
  onReorder?: (newImages: string[]) => void;
}

const BentoImageGrid = ({
  images,
  imageLayouts = new Map(),
  imageMetadata = new Map(),
  onLayoutChange,
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = (newImages) => {
    // Podemos actualizar imageLayouts, imageMetadata acorde a los nuevos índices
    // Si la implementación ya maneja esto a través de claves, no hace falta hacer nada
  }
}: BentoImageGridProps) => {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imagesList, setImagesList] = useState<string[]>(images);
  const gridRef = useRef<HTMLDivElement>(null);

  // Determinar layout para una imagen
  const getLayout = (index: number): ImageLayout => {
    // Si ya existe un layout guardado para esta imagen, usarlo
    if (imageLayouts.has(index)) {
      return imageLayouts.get(index)!;
    }
    
    // Por defecto, usamos siempre el layout vertical para nuevas imágenes
    return "vertical";
  };

  // Función para manejar archivos soltados (mantenemos solo esta funcionalidad)
  const handleExternalFileDrop = (files: FileList) => {
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };
  
  // Actualizar el estado local cuando cambien las imágenes externas
  useEffect(() => {
    setImagesList(images);
  }, [images]);

  // Manejar la selección de archivos mediante el input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Procesar los archivos
  const handleFiles = (files: FileList) => {
    const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }
    });
    
    onImagesAdd(newImages);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Nota: La funcionalidad de arrastre ha sido temporalmente eliminada


  
  // Manejar clic en la imagen para abrir detalles
  const handleImageClick = (index: number, e: React.MouseEvent) => {
    // Solo si el clic no fue en los botones de layout
    if (e.target instanceof HTMLButtonElement) return;
    
    setSelectedImageIndex(index);
    setIsDetailPopupOpen(true);
  };
  
  // Manejar la reordenación de imágenes cuando se complete el arrastre
  const handleReorder = (newOrder: string[]) => {
    setImagesList(newOrder);
    onReorder(newOrder);
    
    // Actualizar las posiciones en imageLayouts
    const newLayouts = new Map<number, ImageLayout>();
    newOrder.forEach((imageUrl, newIndex) => {
      // Encontrar el índice antiguo
      const oldIndex = images.findIndex(url => url === imageUrl);
      if (oldIndex !== -1 && imageLayouts.has(oldIndex)) {
        // Transferir el layout de la posición antigua a la nueva
        newLayouts.set(newIndex, imageLayouts.get(oldIndex)!);
      }
    });
    
    // Actualizar cada layout individualmente para mantener consistencia
    newLayouts.forEach((layout, index) => {
      onLayoutChange(index, layout);
    });
  };
  
  // Manejar el inicio de arrastre
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  // Manejar el fin de arrastre
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  // Guardar metadatos de la imagen
  const handleSaveImageMetadata = (title: string, description: string) => {
    if (selectedImageIndex !== null) {
      const imageUrl = images[selectedImageIndex];
      const metadata = { title, description };
      onImageMetadataChange(imageUrl, metadata);
    }
  };

  return (
    <motion.div
      className="w-full p-4 rounded-xl transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Reorder.Group
        as="div"
        className="grid grid-cols-3 gap-5"
        ref={gridRef}
        axis="y"
        values={imagesList}
        onReorder={handleReorder}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleExternalFileDrop(e.dataTransfer.files);
          }
        }}
      >
        <AnimatePresence>
          {imagesList.map((imageUrl, index) => {
            const layout = getLayout(index);
            // El layout se aplica directamente en el style con gridColumn y gridRow

            return (
              <Reorder.Item
                key={imageUrl}
                value={imageUrl}
                as="div"
                dragListener={false} // Controlamos el drag con el botón, no con todo el elemento
                // Usaremos controles personalizados a través del botón de arrastre
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl overflow-hidden transition-shadow duration-200 ${hoveredImage === index ? 'shadow-lg ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700 dark:ring-offset-gray-900' : 'shadow-md'} group ${!isLiveMode ? 'cursor-pointer' : ''} ${draggedIndex === index ? 'z-10 opacity-90' : ''}`}
                style={{
                  gridColumn: `span ${layout === 'horizontal' ? 2 : 1}`,
                  gridRow: `span ${layout === 'vertical' ? 2 : 1}`,
                  minHeight: layout === 'square' ? '200px' : layout === 'vertical' ? '400px' : '200px'
                }}
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: draggedIndex === index ? "0 20px 25px -5px rgb(0 0 0 / 0.2)" : "none"
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout

              >
                <Image
                  src={imageUrl}
                  alt={imageMetadata.get(imageUrl)?.title || `Imagen ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 will-change-transform hover:scale-105 cursor-pointer"
                  loading="lazy"
                  onClick={(e) => handleImageClick(index, e)}
                />
                
                {hoveredImage === index && !isLiveMode && (
                  <>
                    {/* Botón de arrastrar */}
                    <motion.div
                      className="absolute top-2 left-2 z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="bg-black/70 text-white p-1 rounded-full hover:bg-black/80 cursor-grab active:cursor-grabbing"
                        title="Arrastra para mover esta imagen"
                        aria-label="Arrastrar imagen"
                        onPointerDown={(e) => {
                          // Iniciamos el arrastre al hacer clic en el botón
                          const item = e.currentTarget.closest('[data-value]') as HTMLElement;
                          if (item) {
                            // @ts-ignore - Framer Motion añade esta función al elemento
                            item._dragControls?.start(e);
                            handleDragStart(index);
                          }
                        }}
                      >
                        <Move size={14} />
                      </div>
                    </motion.div>

                    {/* Botón de eliminar */}
                    <motion.div
                      className="absolute top-2 right-2 z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        className="bg-black/70 text-white p-1 rounded-full hover:bg-black/80"
                        onClick={() => onImageRemove(index)}
                        aria-label="Eliminar imagen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </motion.div>

                    {/* Botones de layout */}
                    <motion.div
                      className="absolute bottom-2 right-2 z-10 flex space-x-1 bg-black/60 backdrop-blur-sm rounded-full p-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => onLayoutChange(index, "square")}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${getLayout(index) === "square" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                        title="Formato cuadrado"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onLayoutChange(index, "vertical")}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${getLayout(index) === "vertical" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                        title="Formato vertical"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="3" width="12" height="18" rx="1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onLayoutChange(index, "horizontal")}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${getLayout(index) === "horizontal" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                        title="Formato horizontal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="6" width="18" height="12" rx="1" />
                        </svg>
                      </button>
                    </motion.div>
                  </>
                )}
              </Reorder.Item>
            );
          })}
          {/* Botón minimalista para agregar imágenes - oculto en modo live */}
          {!isLiveMode && (
            <motion.div
              className="flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={openFileDialog}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ gridColumn: 'span 1', gridRow: 'span 1' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs text-gray-400/70 dark:text-gray-500/70 mt-1 font-light">
                Agregar
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Reorder.Group>

      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
        aria-label="Seleccionar imágenes"
      />
      
      {/* Popup de detalles de imagen */}
      {selectedImageIndex !== null && (
        <ImageDetailPopup
          isOpen={isDetailPopupOpen}
          onClose={() => setIsDetailPopupOpen(false)}
          imageUrl={images[selectedImageIndex]}
          initialTitle={imageMetadata.get(images[selectedImageIndex])?.title || ""}
          initialDescription={imageMetadata.get(images[selectedImageIndex])?.description || ""}
          onSave={handleSaveImageMetadata}
          isLiveMode={isLiveMode}
        />
      )}
      
      {/* Estilos para animaciones */}
      <style jsx global>{`
        .return-animation {
          transition: transform 0.3s ease-in-out;
          animation: returnToPosition 0.3s ease-in-out;
        }
        
        @keyframes returnToPosition {
          0% { transform: scale(0.97); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        

      `}</style>
    </motion.div>
  );
};

export default BentoImageGrid;
