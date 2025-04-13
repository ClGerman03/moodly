"use client";

import { useState, ChangeEvent, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageDetailPopup from "../popups/ImageDetailPopup";
import { BentoImageGridProps, ImageBlock as ImageBlockType, ImageLayout } from "./types/bento";
import GridLayout from "react-grid-layout";
import Image from "next/image";
import { Move } from "lucide-react";

// Importar estilos de React-Grid-Layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Tamaño de columna y márgenes
const MARGIN: [number, number] = [20, 20];
const ROW_HEIGHT = 160;

// Dimensiones por tipo de layout
const LAYOUT_DIMENSIONS = {
  square: { w: 1, h: 1 },
  vertical: { w: 1, h: 2 },
  horizontal: { w: 2, h: 1 }
};

// Interfaz para los items de layout
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

/**
 * Grid de imágenes tipo bento con bloques dinámicos usando React-Grid-Layout
 */
const BentoImageGrid = ({
  images,
  imageLayouts = new Map(),
  imageMetadata = new Map(),
  onLayoutChange: onExternalLayoutChange,
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = () => {}
}: BentoImageGridProps) => {
  // Estados locales
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [imageBlocksMap, setImageBlocksMap] = useState<Map<string, ImageBlockType>>(new Map());

  // Referencia al contenedor de la cuadrícula
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Número de columnas en el grid
  const gridCols = 4;
  
  // Estado para almacenar el ancho del contenedor
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Efecto para medir el ancho del contenedor y responder a cambios de tamaño
  useEffect(() => {
    if (gridRef.current) {
      // Función para actualizar el ancho
      const updateWidth = () => {
        if (gridRef.current) {
          setContainerWidth(gridRef.current.offsetWidth);
        }
      };
      
      // Actualizar inmediatamente
      updateWidth();
      
      // Guardar referencia actual para usarla en la limpieza
      const currentRef = gridRef.current;
      
      // Configurar el observer para responder a cambios de tamaño
      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(currentRef);
      
      // Limpiar observer al desmontar
      return () => {
        resizeObserver.unobserve(currentRef);
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // Efecto para inicializar el layout basado en las imágenes proporcionadas
  useEffect(() => {
    if (images.length > 0) {
      const newLayout: LayoutItem[] = [];
      const newBlocksMap = new Map<string, ImageBlockType>();
      
      // Crear elementos de layout para cada imagen
      images.forEach((url, index) => {
        const layout = imageLayouts.get(index) || "vertical";
        const { w, h } = LAYOUT_DIMENSIONS[layout];
        const id = `image-${index}`;
        
        // Añadir al layout de react-grid-layout
        newLayout.push({
          i: id,
          x: (index % gridCols) * w > (gridCols - w) ? 0 : (index % gridCols) * w, // Evitar que sobresalga
          y: Math.floor(index / gridCols) * h,
          w,
          h,
        });
        
        // Guardar información del bloque
        newBlocksMap.set(id, {
          id,
          url,
          layout: layout as ImageLayout,
          metadata: imageMetadata.get(url) || undefined
        });
      });
      
      setLayout(newLayout);
      setImageBlocksMap(newBlocksMap);
    } else {
      setLayout([]);
      setImageBlocksMap(new Map());
    }
  }, [images, imageLayouts, imageMetadata]);

  // Manejar selección de archivos
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Procesar archivos seleccionados o soltados
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
  
  // Abrir el diálogo de selección de archivos
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Manejar cambios en el layout (cuando se arrastran elementos)
  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    if (newLayout.length === 0) return;
    
    // Solo procesar si hay cambios en las posiciones (no en dimensiones)
    // Esto evita bucles infinitos de actualización
    const positionsChanged = newLayout.some((item, idx) => {
      const currentItem = layout[idx];
      return !currentItem || 
        item.i !== currentItem.i || 
        item.x !== currentItem.x || 
        item.y !== currentItem.y;
    });
    
    // Si no hay cambios en posiciones, no actualizamos el estado
    if (!positionsChanged) return;
    
    // Crear una copia del layout actual para modificarlo
    let updatedLayout = [...newLayout];
    
    // Para cada elemento del nuevo layout, mantener sus dimensiones originales
    updatedLayout = updatedLayout.map(newItem => {
      // Buscar el elemento en el mapa de bloques para obtener su tipo de layout
      const block = Array.from(imageBlocksMap.values()).find(block => block.id === newItem.i);
      
      if (block) {
        // Obtener las dimensiones basadas en su tipo de layout
        const { w, h } = LAYOUT_DIMENSIONS[block.layout];
        
        // Mantener las dimensiones originales
        return {
          ...newItem,
          w,
          h
        };
      }
      return newItem;
    });
    
    // Actualizar el estado del layout
    setLayout(updatedLayout);
    
    // Crear un nuevo orden de imágenes basado en el layout
    const orderedImages = updatedLayout
      .sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      })
      .map(item => {
        const block = imageBlocksMap.get(item.i);
        return block ? block.url : "";
      })
      .filter(Boolean);
    
    // Notificar el nuevo orden
    onReorder(orderedImages);
  };
  
  // Manejar cambio de layout (tamaño) de un bloque
  const handleBlockLayoutChange = (id: string, newLayoutType: ImageLayout) => {
    const blockInfo = imageBlocksMap.get(id);
    if (!blockInfo) return;
    
    // Actualizar el tipo de layout en el mapa
    const updatedBlock = { ...blockInfo, layout: newLayoutType };
    const newBlocksMap = new Map(imageBlocksMap);
    newBlocksMap.set(id, updatedBlock);
    setImageBlocksMap(newBlocksMap);
    
    // Encontrar el elemento en el layout actual
    const currentLayoutItem = layout.find(item => item.i === id);
    if (!currentLayoutItem) return;
    
    // Obtener nuevas dimensiones según el tipo de layout
    const { w, h } = LAYOUT_DIMENSIONS[newLayoutType];
    
    // Verificar si hay espacio en la posición actual
    // Si no hay espacio o causaría una colisión, React-Grid-Layout lo moverá automáticamente
    const newLayout = layout.map(item => {
      if (item.i === id) {
        return { 
          ...item, 
          w, 
          h,
          // La opción static:true hace que el elemento mantenga su posición
          // incluso si causa una colisión; el resto de elementos se adaptarán
          static: true 
        };
      }
      return { ...item, static: false };
    });
    
    // Aplicar el nuevo layout
    setLayout(newLayout);
    
    // Después de un breve tiempo, eliminar la propiedad 'static' para permitir el movimiento normal
    setTimeout(() => {
      setLayout(newLayout.map(item => ({ ...item, static: false })));
    }, 50);
    
    // Notificar cambio al componente padre
    const index = images.findIndex(url => url === blockInfo.url);
    if (index !== -1) {
      onExternalLayoutChange(index, newLayoutType);
    }
  };
  
  // Manejar clic en imagen para ver detalles
  const handleImageClick = (id: string, e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return;
    
    const block = imageBlocksMap.get(id);
    if (!block) return;
    
    const index = images.findIndex(url => url === block.url);
    if (index !== -1) {
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Eliminar una imagen
  const handleRemoveImage = (id: string) => {
    const block = imageBlocksMap.get(id);
    if (!block) return;
    
    const index = images.findIndex(url => url === block.url);
    if (index !== -1) {
      onImageRemove(index);
    }
  };
  
  // Guardar metadatos de imagen
  const handleSaveImageMetadata = (title: string, description: string) => {
    if (selectedImageIndex === null) return;
    
    const imageUrl = images[selectedImageIndex];
    const metadata = { title, description };
    
    // Actualizar estado local
    const newBlocksMap = new Map(imageBlocksMap);
    for (const [id, block] of newBlocksMap.entries()) {
      if (block.url === imageUrl) {
        newBlocksMap.set(id, { ...block, metadata });
      }
    }
    setImageBlocksMap(newBlocksMap);
    
    // Notificar al componente padre
    onImageMetadataChange(imageUrl, metadata);
  };
  
  // Manejar archivos soltados
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      className="w-full p-4 rounded-xl transition-colors duration-300 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        ref={gridRef}
        className="relative w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {containerWidth > 0 && (
          <GridLayout
            className="layout"
            layout={layout}
            cols={gridCols}
            rowHeight={ROW_HEIGHT}
            width={containerWidth}
            margin={MARGIN}
            onLayoutChange={handleLayoutChange}
            isDraggable={!isLiveMode}
            isResizable={false}
            compactType="vertical"
            useCSSTransforms={true}
            preventCollision={false}
            style={{ position: 'relative' }}
            draggableCancel=".react-resizable-handle"
          >
            {layout.map((item) => {
              const block = imageBlocksMap.get(item.i);
              if (!block) return null;
              
              const isHovered = hoveredImage === block.id;
              
              return (
                <div 
                  key={item.i} 
                  className={`relative overflow-hidden rounded-xl shadow-md transition-all duration-150 ${
                    isHovered ? 'ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700 dark:ring-offset-gray-900' : ''
                  } ${!isLiveMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onMouseEnter={() => setHoveredImage(block.id)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  {/* Imagen */}
                  <div className="w-full h-full relative" onClick={(e) => !isLiveMode && handleImageClick(block.id, e)}>
                    <Image
                      src={block.url}
                      alt={block.metadata?.title || `Imagen`}
                      fill
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
                      className="object-cover transition-transform duration-500 will-change-transform hover:scale-105"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  
                  {/* Controles que aparecen al hacer hover */}
                  {isHovered && !isLiveMode && (
                    <AnimatePresence>
                      {/* Indicador de arrastre */}
                      <motion.div
                        className="absolute top-2 left-2 z-20"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="bg-black/70 text-white p-1 rounded-full hover:bg-black/80 cursor-grab active:cursor-grabbing"
                          title="Arrastra para mover esta imagen"
                          aria-label="Arrastrar imagen"
                        >
                          <Move size={14} />
                        </div>
                      </motion.div>

                      {/* Botón de eliminar */}
                      <motion.div
                        className="absolute top-2 right-2 z-20"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          className="bg-black/70 text-white p-1 rounded-full hover:bg-black/80"
                          onClick={() => handleRemoveImage(block.id)}
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
                        className="absolute bottom-2 right-2 z-20 flex space-x-1 bg-black/60 backdrop-blur-sm rounded-full p-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => handleBlockLayoutChange(block.id, "square")}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${block.layout === "square" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                          title="Formato cuadrado"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleBlockLayoutChange(block.id, "vertical")}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${block.layout === "vertical" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                          title="Formato vertical"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="3" width="12" height="18" rx="1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleBlockLayoutChange(block.id, "horizontal")}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${block.layout === "horizontal" ? "bg-white/80 text-black" : "text-white/80 hover:bg-white/20"}`}
                          title="Formato horizontal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="6" width="18" height="12" rx="1" />
                          </svg>
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </GridLayout>
        )}
        
        {/* Botón para agregar imágenes - oculto en modo live */}
        {!isLiveMode && (
          <motion.div
            className="flex flex-col items-center justify-center text-center cursor-pointer mt-5 h-40"
            onClick={openFileDialog}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs text-gray-400/70 dark:text-gray-500/70 mt-1 font-light">
              Agregar
            </span>
          </motion.div>
        )}
      </div>

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
          initialTitle={
            Array.from(imageBlocksMap.values())
              .find(block => block.url === images[selectedImageIndex])?.metadata?.title || ""
          }
          initialDescription={
            Array.from(imageBlocksMap.values())
              .find(block => block.url === images[selectedImageIndex])?.metadata?.description || ""
          }
          onSave={handleSaveImageMetadata}
          isLiveMode={isLiveMode}
        />
      )}
      
      {/* Estilos personalizados para ocultar el placeholder de arrastre */}
      <style jsx global>{`
        /* Eliminar el placeholder rosa durante el arrastre */
        .react-grid-placeholder {
          display: none !important;
        }
        
        /* Estilos para mejorar la apariencia del grid */
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: transparent !important;
          opacity: 0 !important;
        }
        
        .react-grid-item.react-draggable-dragging {
          z-index: 100;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default BentoImageGrid;
