"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import GridLayout from "react-grid-layout";
import { ImageLayout } from "@/app/tablero/components/sections/types/bento";
import { Section } from "@/app/tablero/types";
import { ThumbsUp, ThumbsDown, HelpCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

// Importar estilos de React-Grid-Layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Configuraciones constantes
const MARGIN: [number, number] = [20, 20];
const ROW_HEIGHT = 160;

// Dimensiones para cada tipo de layout de imagen
const LAYOUT_DIMENSIONS = {
  square: { w: 1, h: 1 },
  vertical: { w: 1, h: 2 },
  horizontal: { w: 2, h: 1 }
} as const;

interface BentoImageFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente de feedback para BentoImageGrid
 * Muestra las imágenes respetando los layouts configurados originalmente
 * y permitirá interacciones de feedback (selección, comentarios, etc.)
 */
const BentoImageFeedback: React.FC<BentoImageFeedbackProps> = ({ 
  section,
  onFeedback
}) => {
  // Referencias y estados
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [gridCols, setGridCols] = useState(4);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [tappedImage, setTappedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative' | 'neutral' | null>>({});
  
  // Estados para carrusel móvil
  const [currentMobileImageIndex, setCurrentMobileImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Extraer datos de la sección
  const images = useMemo(() => section.data?.images || [], [section.data?.images]);
  
  // Asegurarse de que imageLayouts sea un objeto compatible con el grid
  const imageLayouts = useMemo(() => section.data?.imageLayouts, [section.data?.imageLayouts]);
  
  // Construir un mapa de bloques similar al que usa BentoImageGrid
  const imageBlocksMap = useRef(new Map<string, {id: string, url: string, layout: ImageLayout}>());
  
  // Este efecto crea una estructura de datos similar a la que usa BentoImageGrid
  useEffect(() => {
    // Limpiar el mapa anterior
    imageBlocksMap.current.clear();
    
    // Crear entradas para cada imagen
    images.forEach((url, index) => {
      const imageId = `image-${index}`;
      let layout: ImageLayout = "square";
      
      // Intentar obtener el layout guardado para esta imagen
      if (imageLayouts) {
        // Si es un Map, usar get, si es un objeto, acceder por índice
        const savedLayout = imageLayouts instanceof Map 
          ? imageLayouts.get(index.toString()) 
          : imageLayouts[index];
          
        if (savedLayout && (savedLayout === "square" || savedLayout === "vertical" || savedLayout === "horizontal")) {
          layout = savedLayout;
        }
      }
      
      // Guardar la información del bloque
      imageBlocksMap.current.set(imageId, { id: imageId, url, layout });
    });
  }, [images, imageLayouts]);
  
  // Función para calcular el número de columnas según el ancho del contenedor
  const calculateColumns = (width: number) => {
    if (width < 640) return 1;      // Móviles (1 columna como en el original)
    else if (width < 960) return 2;  // Tablets
    else return 4;                   // Desktop
  };
  
  // Manejar el gesto de deslizamiento para navegación móvil
  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return;
    
    // Detectar dirección del deslizamiento (izquierda o derecha)
    if (info.offset.x < -50) { // Deslizamiento hacia la izquierda -> siguiente imagen
      setDirection(1);
      setCurrentMobileImageIndex(prev => 
        prev < images.length - 1 ? prev + 1 : prev
      );
    } else if (info.offset.x > 50) { // Deslizamiento hacia la derecha -> imagen anterior
      setDirection(-1);
      setCurrentMobileImageIndex(prev => 
        prev > 0 ? prev - 1 : prev
      );
    }
  };
  
  // Navegar a la imagen anterior en el carrusel móvil
  const goToPreviousImage = () => {
    if (currentMobileImageIndex > 0) {
      setDirection(-1);
      setCurrentMobileImageIndex(prev => prev - 1);
    }
  };
  
  // Navegar a la siguiente imagen en el carrusel móvil
  const goToNextImage = () => {
    if (currentMobileImageIndex < images.length - 1) {
      setDirection(1);
      setCurrentMobileImageIndex(prev => prev + 1);
    }
  };
  
  // Generar layout basado en las imágenes y sus configuraciones originales
  const generateLayout = () => {
    const blocks = Array.from(imageBlocksMap.current.values());
    
    // Ordenar bloques por su índice para mantener consistencia
    blocks.sort((a, b) => {
      const indexA = parseInt(a.id.split('-')[1]);
      const indexB = parseInt(b.id.split('-')[1]);
      return indexA - indexB;
    });
    
    // Primera pasada: Crear los items con dimensiones pero sin posicionar
    const layoutItems = blocks.map(block => {
      const { w, h } = LAYOUT_DIMENSIONS[block.layout];
      return {
        i: block.id,
        w,
        h,
        x: 0, // Valores temporales
        y: 0, // que se actualizarán
        static: true
      };
    });
    
    // Segunda pasada: Posicionar cada elemento en la cuadrícula
    // usando un algoritmo similar al de BentoImageGrid
    const positionedItems = [] as {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
      static: boolean;
    }[];
    
    let currentY = 0;
    const itemsInRow: { [key: number]: number } = {}; // Para rastrear alturas por fila
    
    layoutItems.forEach(item => {
      // Encontrar una posición válida (primer espacio disponible de izquierda a derecha)
      let posX = 0;
      let posY = currentY;
      let placed = false;
      
      // Intentar colocar el elemento en la fila actual
      while (!placed) {
        // Verificar si la posición está libre
        const collision = positionedItems.some(placedItem => {
          return (
            posX < placedItem.x + placedItem.w &&
            posX + item.w > placedItem.x &&
            posY < placedItem.y + placedItem.h &&
            posY + item.h > placedItem.y
          );
        });
        
        if (!collision) {
          // Posición libre encontrada
          placed = true;
          positionedItems.push({
            ...item,
            x: posX,
            y: posY
          });
          
          // Actualizar altura máxima para esta fila
          const rowEnd = posY + item.h;
          for (let y = posY; y < rowEnd; y++) {
            itemsInRow[y] = Math.max(itemsInRow[y] || 0, posX + item.w);
          }
        } else {
          // Intentar la siguiente posición horizontal
          posX++;
          
          // Si llegamos al límite de columnas, pasar a la siguiente fila
          if (posX + item.w > gridCols) {
            posX = 0;
            posY++;
            // Actualizar el punto de inicio para futuras colocaciones
            currentY = Math.max(currentY, posY);
          }
        }
      }
    });
    
    return positionedItems;
  };
  
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
          
          // Detectar si estamos en un dispositivo móvil
          setIsMobile(window.innerWidth < 768);
        }
      };
      
      // Actualizar inmediatamente
      updateWidth();
      
      // También actualizar cuando la ventana cambie de tamaño
      window.addEventListener('resize', updateWidth);
      
      // Limpiar el event listener
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }
    
    // Cerrar el panel de feedback al hacer clic fuera
    const handleClickOutside = (e: MouseEvent) => {
      if (tappedImage && gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setTappedImage(null);
      }
    };
    
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [tappedImage]);
  
  // Manejar interacción de feedback de imagen
  const handleImageFeedback = (imageUrl: string, type: 'positive' | 'negative' | 'neutral' | 'comment') => {
    // Actualizar estado local si es positivo o negativo
    if (type !== 'comment') {
      setUserFeedback(prev => ({
        ...prev,
        [imageUrl]: type
      }));
      
      // Opcionalmente, enviar feedback al componente padre
      onFeedback?.(section.id, {
        imageFeedback: {
          ...userFeedback,
          [imageUrl]: type
        }
      });
    } else {
      // Para comentarios, podríamos implementar diferentes acciones en el futuro
      // Como abrir un panel de comentarios o un popup
      onFeedback?.(section.id, {
        commentRequested: imageUrl
      });
    }
    
    // Cerrar panel de feedback en móvil
    if (isMobile) {
      setTappedImage(null);
    }
  };
  
  // Manejar clic/tap en imagen
  const handleImageTap = (imageUrl: string, e: React.MouseEvent) => {
    // Evitar propagación para que no se cierre inmediatamente
    e.stopPropagation();
    
    if (isMobile) {
      // En dispositivos móviles, alternar el estado de tap
      setTappedImage(tappedImage === imageUrl ? null : imageUrl);
    }
    // En desktop, el hover ya maneja la interacción
  };
  
  // Si no hay imágenes, mostrar mensaje
  if (!images.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene imágenes
      </div>
    );
  }
  
  // Generar el layout
  const layoutItems = generateLayout();
  
  return (
    <div className="relative" ref={gridRef}>
      {/* Vista móvil: carrusel de una imagen a la vez */}
      {isMobile && containerWidth > 0 ? (
        <div className="relative h-[75vh] w-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div 
              key={currentMobileImageIndex}
              custom={direction}
              className="absolute inset-0 w-full h-full flex items-center justify-center p-4"
              initial={{ opacity: 0, x: direction * 250 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 250 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleSwipe}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <Image
                  src={images[currentMobileImageIndex]}
                  alt={`Image ${currentMobileImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
                
                {/* Indicador de feedback ya dado */}
                {userFeedback[images[currentMobileImageIndex]] && !hoveredImage && !tappedImage && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/70 text-white">
                    {userFeedback[images[currentMobileImageIndex]] === 'positive' ? (
                      <ThumbsUp size={11} strokeWidth={2} />
                    ) : userFeedback[images[currentMobileImageIndex]] === 'negative' ? (
                      <ThumbsDown size={11} strokeWidth={2} />
                    ) : (
                      <HelpCircle size={11} strokeWidth={2} />
                    )}
                  </div>
                )}
                
                {/* Controles de navegación del carrusel */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                  <motion.button 
                    className={`p-2 rounded-full bg-black/50 text-white pointer-events-auto ${currentMobileImageIndex === 0 ? 'opacity-30' : 'opacity-70'}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousImage}
                    disabled={currentMobileImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  
                  <motion.button 
                    className={`p-2 rounded-full bg-black/50 text-white pointer-events-auto ${currentMobileImageIndex === images.length - 1 ? 'opacity-30' : 'opacity-70'}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextImage}
                    disabled={currentMobileImageIndex === images.length - 1}
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
                
                {/* Panel de feedback y opciones */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center mb-10">
                  <div 
                    className="flex gap-2 items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Opción positiva - Pulgar arriba */}
                    <motion.button
                      className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleImageFeedback(images[currentMobileImageIndex], 'positive')}
                      aria-label="Like"
                    >
                      <motion.div whileHover={{ color: "rgba(167, 243, 208, 0.9)" }}>
                        <ThumbsUp size={16} strokeWidth={1.5} />
                      </motion.div>
                    </motion.button>
                    
                    {/* Opción negativa - Pulgar abajo */}
                    <motion.button
                      className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleImageFeedback(images[currentMobileImageIndex], 'negative')}
                      aria-label="Dislike"
                    >
                      <motion.div whileHover={{ color: "rgba(252, 165, 165, 0.9)" }}>
                        <ThumbsDown size={16} strokeWidth={1.5} />
                      </motion.div>
                    </motion.button>
                    
                    {/* Opción neutral - Interrogación */}
                    <motion.button
                      className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleImageFeedback(images[currentMobileImageIndex], 'neutral')}
                      aria-label="Neutral feedback"
                    >
                      <motion.div whileHover={{ color: "rgba(186, 230, 253, 0.9)" }}>
                        <HelpCircle size={16} strokeWidth={1.5} />
                      </motion.div>
                    </motion.button>
                    
                    {/* Opción de comentario */}
                    <motion.button
                      className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleImageFeedback(images[currentMobileImageIndex], 'comment')}
                      aria-label="Add comment"
                    >
                      <motion.div whileHover={{ color: "rgba(209, 213, 219, 0.95)" }}>
                        <MessageSquare size={16} strokeWidth={1.5} />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
                
                {/* Indicador de posición */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full ${idx === currentMobileImageIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Vista desktop: grid de imágenes */
        <GridLayout
          className="layout"
          layout={layoutItems}
          cols={gridCols}
          rowHeight={ROW_HEIGHT}
          width={containerWidth}
          margin={MARGIN}
          isDraggable={false}
          isResizable={false}
          compactType={isMobile ? "vertical" : "horizontal"}
          useCSSTransforms={true}
        >
          {images.map((imageUrl, index) => {
            const imageId = `image-${index}`;
            
            return (
              <div key={imageId} className="overflow-hidden relative rounded-xl">
                <motion.div
                  className="relative w-full h-full cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  onHoverStart={() => !isMobile && setHoveredImage(imageUrl)}
                  onHoverEnd={() => !isMobile && setHoveredImage(null)}
                  onClick={(e) => handleImageTap(imageUrl, e)}
                >
                  <Image
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={index < 4} // Priorizar las primeras 4 imágenes
                  />
                  
                  {/* Indicador de feedback ya dado */}
                  {userFeedback[imageUrl] && !hoveredImage && !tappedImage && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/70 text-white">
                      {userFeedback[imageUrl] === 'positive' ? (
                        <ThumbsUp size={11} strokeWidth={2} />
                      ) : userFeedback[imageUrl] === 'negative' ? (
                        <ThumbsDown size={11} strokeWidth={2} />
                      ) : (
                        <HelpCircle size={11} strokeWidth={2} />
                      )}
                    </div>
                  )}
                  
                  {/* Panel de feedback (visible en hover o tap) - Estilo BentoImageGrid */}
                  <AnimatePresence>
                    {(hoveredImage === imageUrl || tappedImage === imageUrl) && (
                      <motion.div
                        className="absolute inset-0 bg-black/40 flex items-end justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Opciones de feedback centradas abajo */}
                        <div className="flex gap-2 items-center mb-3">
                          {/* Opciones feedback con estilo BentoImageGrid */}
                          <AnimatePresence>
                            {/* Opción positiva - Pulgar arriba */}
                            <motion.button
                              className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15, delay: 0.05 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageFeedback(imageUrl, 'positive');
                              }}
                              aria-label="Like"
                            >
                              <motion.div
                                whileHover={{ color: "rgba(167, 243, 208, 0.9)" }} // Hover verde sutil
                              >
                                <ThumbsUp size={16} strokeWidth={1.5} />
                              </motion.div>
                            </motion.button>
                            
                            {/* Opción negativa - Pulgar abajo */}
                            <motion.button
                              className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15, delay: 0.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleImageFeedback(imageUrl, 'negative');
                              }}
                              aria-label="Dislike"
                            >
                              <motion.div
                                whileHover={{ color: "rgba(252, 165, 165, 0.9)" }} // Hover rojo sutil
                              >
                                <ThumbsDown size={16} strokeWidth={1.5} />
                              </motion.div>
                            </motion.button>
                            
                            {/* Opción neutral - Interrogación */}
                            <motion.button
                              className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15, delay: 0.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleImageFeedback(imageUrl, 'neutral');
                              }}
                              aria-label="Neutral feedback"
                            >
                              <motion.div
                                whileHover={{ color: "rgba(186, 230, 253, 0.9)" }} // Hover azul sutil
                              >
                                <HelpCircle size={16} strokeWidth={1.5} />
                              </motion.div>
                            </motion.button>
                          </AnimatePresence>
                        </div>
                        
                        {/* Botón de comentario en esquina inferior derecha */}
                        <motion.button
                          className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15, delay: 0.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageFeedback(imageUrl, 'comment');
                          }}
                          aria-label="Add comment"
                        >
                          <motion.div
                            whileHover={{ color: "rgba(209, 213, 219, 0.95)" }} // Hover gris sutil
                          >
                            <MessageSquare size={16} strokeWidth={1.5} />
                          </motion.div>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
};

export default BentoImageFeedback;
