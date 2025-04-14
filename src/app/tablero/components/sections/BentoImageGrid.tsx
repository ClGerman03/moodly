"use client";

import { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
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

// Dimensiones para cada tipo de layout de imagen
// Ajustando los tamaños para optimizar el espacio y evitar colapsos
const LAYOUT_DIMENSIONS = {
  square: { w: 1, h: 1 },       // Mantiene 1x1
  vertical: { w: 1, h: 2 },     // Mantiene 1x2 
  horizontal: { w: 2, h: 1 }    // Mantiene 2x1
} as const;

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
  // Referencia para el timeout de actualización del layout
  const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Número de columnas en el grid - Adaptativo según tamaño de pantalla
  const [gridCols, setGridCols] = useState(4);
  
  // Función para calcular el número de columnas según el ancho del contenedor
  const calculateColumns = (width: number) => {
    if (width < 640) { // Móviles
      return 1;
    } else if (width < 960) { // Tablets
      return 2;
    } else { // Desktop
      return 4;
    }
  };
  
  // Estado para almacenar el ancho del contenedor
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Efecto para medir el ancho del contenedor y responder a cambios de tamaño
  useEffect(() => {
    if (gridRef.current) {
      // Función para actualizar el ancho y el número de columnas
      const updateWidth = () => {
        if (gridRef.current) {
          const newWidth = gridRef.current.offsetWidth;
          setContainerWidth(newWidth);
          
          // Actualizar el número de columnas según el ancho
          const newCols = calculateColumns(newWidth);
          setGridCols(newCols);
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
  
  // Función para recalcular el layout completo
  const recalculateLayout = useCallback(() => {
    if (!images || images.length === 0) {
      setLayout([]);
      setImageBlocksMap(new Map());
      return;
    }
    
    const initialLayout: LayoutItem[] = [];
    const blocksMap = new Map<string, ImageBlockType>();
    
    // Usa una cuadrícula temporal para el nuevo cálculo
    const tempGrid: boolean[][] = Array(20).fill(null).map(() => Array(gridCols).fill(false));
    
    // Función para encontrar posición disponible
    const findAvailablePos = (w: number, h: number): [number, number] => {
      // Ajustar el ancho máximo al número de columnas disponibles
      const adjustedW = Math.min(w, gridCols);
      
      for (let y = 0; y < tempGrid.length; y++) {
        for (let x = 0; x < gridCols; x++) {
          // Verificar si hay espacio para este elemento
          let canPlace = true;
          for (let i = y; i < y + h && canPlace; i++) {
            for (let j = x; j < x + adjustedW && canPlace; j++) {
              if (i >= tempGrid.length || j >= gridCols || tempGrid[i][j]) {
                canPlace = false;
              }
            }
          }
          
          if (canPlace) {
            // Marcar como ocupado
            for (let i = y; i < y + h; i++) {
              for (let j = x; j < x + adjustedW; j++) {
                if (i < tempGrid.length && j < gridCols) {
                  tempGrid[i][j] = true;
                }
              }
            }
            return [x, y];
          }
        }
      }
      return [0, tempGrid.length]; // Si no hay espacio, colocar al final
    };
    
    images.forEach((url, index) => {
      const layoutType = imageLayouts?.get(index) || 'square';
      const id = `image-${index}-${Date.now().toString(36)}`;
      
      // Obtener dimensiones según el tipo de layout
      let { w, h } = LAYOUT_DIMENSIONS[layoutType];
      
      // Si estamos en mobile (1 columna), ajustar los elementos horizontales
      if (gridCols === 1 && layoutType === 'horizontal') {
        w = 1; // Limitar a 1 columna en móvil
        h = 1; // Mantener proporciones similares
      }
      
      // Encontrar posición disponible
      const [x, y] = findAvailablePos(w, h);
      
      const layoutItem: LayoutItem = {
        i: id,
        x,
        y,
        w: Math.min(w, gridCols), // Asegurarse de que no exceda el número de columnas
        h,
        static: false
      };
      
      initialLayout.push(layoutItem);
      
      // Guardar información de cada bloque
      blocksMap.set(id, {
        id,
        url,
        layout: layoutType as ImageLayout,
        metadata: imageMetadata.get(url) || undefined
      });
    });
    
    setLayout(initialLayout);
    setImageBlocksMap(blocksMap);
  }, [images, imageLayouts, imageMetadata, gridCols]);
  
  // Recalcular el layout cuando cambia el número de columnas
  useEffect(() => {
    if (images && images.length > 0 && containerWidth > 0) {
      // Reiniciar el cálculo del layout cuando cambia el número de columnas
      recalculateLayout();
    }
  }, [gridCols, images, containerWidth, recalculateLayout]);
  
  // Efecto para crear el layout inicial basado en imágenes y layoutType
  useEffect(() => {
    if (containerWidth > 0 && images && images.length > 0) {
      recalculateLayout();
    }
  }, [images, imageLayouts, imageMetadata, containerWidth, recalculateLayout]); // Ya no depende de gridCols porque tenemos otro efecto para eso
  
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
    
    // Debounce con un delay más amplio para prevenir titileo y updates frecuentes
    // Usando un identificador para cancelar actualizaciones previas pendientes
    if (layoutUpdateTimeoutRef.current) {
      clearTimeout(layoutUpdateTimeoutRef.current);
    }
    
    layoutUpdateTimeoutRef.current = setTimeout(() => {
      // Mejorado: utilizar un algoritmo más estable para ordenar las imágenes
      // Ordenando primero por fila (y) y luego por columna (x)
      const orderedImages = updatedLayout
        .sort((a, b) => {
          // Primero ordenar por filas
          if (Math.floor(a.y) !== Math.floor(b.y)) {
            return Math.floor(a.y) - Math.floor(b.y);
          }
          // Luego por columnas dentro de la misma fila
          return a.x - b.x;
        })
        .map(item => {
          const block = imageBlocksMap.get(item.i);
          return block ? block.url : "";
        })
        .filter(Boolean);
      
      // Notificar el nuevo orden al componente padre
      onReorder(orderedImages);
      layoutUpdateTimeoutRef.current = null;
    }, 300); // Aumentando el timeout para evitar actualizaciones demasiado frecuentes
  };
  
  // Manejar cambio de layout (tamaño) de un bloque
  const handleBlockLayoutChange = (id: string, newLayoutType: ImageLayout) => {
    const blockInfo = imageBlocksMap.get(id);
    if (!blockInfo) return;
    
    // Actualizar el tipo de layout en el mapa y notificar al padre
    // antes de actualizar el estado local para evitar renderizados en cascada
    const index = images.findIndex(url => url === blockInfo.url);
    if (index !== -1 && typeof index === 'number') {
      onExternalLayoutChange(index, newLayoutType);
    }
    
    // Obtener nuevas dimensiones según el tipo de layout
    const { w, h } = LAYOUT_DIMENSIONS[newLayoutType];
    
    // Actualizar todo en un solo batch para minimizar renderizados
    // 1. Actualizar el bloque en el mapa
    const updatedBlock = { ...blockInfo, layout: newLayoutType };
    const newBlocksMap = new Map(imageBlocksMap);
    newBlocksMap.set(id, updatedBlock);
    
    // 2. Crear el nuevo layout en una sola operación sin static:true
    const newLayout = layout.map(item => {
      if (item.i === id) {
        return { ...item, w, h }; // Sin static:true para evitar el segundo renderizado
      }
      return item;
    });
    
    // Actualizar ambos estados juntos para reducir renderizados
    setImageBlocksMap(newBlocksMap);
    setLayout(newLayout);
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
      className="w-full p-4 rounded-xl transition-colors duration-300 overflow-hidden"
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
            compactType={"horizontal"}
            useCSSTransforms={true}
            preventCollision={false}
            style={{ position: 'relative' }}
            draggableHandle=".drag-handle"
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
                  }`}
                  onMouseEnter={() => setHoveredImage(block.id)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  {/* Imagen */}
                  <div className="w-full h-full relative cursor-pointer" onClick={(e) => handleImageClick(block.id, e)}>
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
                        className="absolute top-2 left-2 z-20 cursor-move"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="bg-black/70 text-white p-1 rounded-full hover:bg-black/80 cursor-grab active:cursor-grabbing drag-handle"
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
          transition: all 300ms ease;
          transition-property: left, top, width, height;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform, width, height;
          will-change: transform;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: transparent !important;
          opacity: 0 !important;
        }
        
        .react-grid-item.react-draggable-dragging {
          z-index: 100;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          transition: none !important;
          cursor: grabbing !important;
        }
      `}</style>
    </motion.div>
  );
};

export default BentoImageGrid;
