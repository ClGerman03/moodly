"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, Maximize2, ArrowUp, ArrowDown } from "lucide-react";
import { ImageMetadata } from "./types";

interface MobileGalleryProps {
  images: string[];
  imageMetadata: Map<string, ImageMetadata>;
  hoveredImage: string | null;
  touchedImage: string | null;
  isLiveMode: boolean;
  onImageClick: (index: number) => void;
  onHover: (url: string | null) => void;
  onMoveUp: (index: number, e: React.MouseEvent) => void;
  onMoveDown: (index: number, e: React.MouseEvent) => void;
  onImageExpand: (index: number, e: React.MouseEvent) => void;
  onImageRemove: (index: number, e: React.MouseEvent) => void;
}

/**
 * Componente de galería optimizado para dispositivos móviles
 */
const MobileGallery: React.FC<MobileGalleryProps> = ({
  images,
  imageMetadata,
  // hoveredImage no se usa en dispositivos móviles, se mantiene en la interfaz
  // para compatibilidad con la API pero se omite en la destructuración
  touchedImage,
  isLiveMode,
  onImageClick,
  onHover,
  onMoveUp,
  onMoveDown,
  onImageExpand,
  onImageRemove
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {images.map((url, index) => {
        const metadata = imageMetadata.get(url);
        const isSelected = touchedImage === url;
        
        return (
          <div 
            key={`image-${url}-${index}`}
            className={`relative group rounded-xl overflow-hidden shadow-sm bg-white h-60
                      transition-all duration-200 ${isSelected ? '' : ''}`}
            onClick={(e) => {
              // Evitamos que el evento propague al contenedor padre
              e.stopPropagation();
              
              // Explícitamente solo alternamos el estado de selección de la imagen
              // sin abrir el popup de detalles
              if (!isLiveMode) {
                onHover(isSelected ? null : url);
                onImageClick(index);
              }
            }}
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
            
            {/* Indicador de que la imagen es táctil */}
            {!isLiveMode && !isSelected && (
              <div className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full opacity-70">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            )}
            
            {/* Overlay para título - siempre visible */}
            {metadata?.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                <p className="text-sm text-white font-medium truncate">{metadata.title}</p>
              </div>
            )}
            
            {/* Controles para móvil - visibles al tocar */}
            <AnimatePresence>
              {!isLiveMode && isSelected && (
                <motion.div 
                  className="absolute top-0 left-0 w-full h-full bg-white/60 backdrop-blur-[1px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-2 right-2 flex gap-2">
                    {/* Botones para mover hacia arriba/abajo */}
                    <div className="flex flex-col gap-1">
                      <motion.button
                        className="p-2 bg-gray-800/90 shadow-md text-white rounded-full"
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveUp(index, e);
                        }}
                        disabled={index === 0}
                        style={{ opacity: index === 0 ? 0.5 : 1 }}
                      >
                        <ArrowUp size={16} />
                      </motion.button>
                      
                      <motion.button
                        className="p-2 bg-gray-800/90 shadow-md text-white rounded-full"
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDown(index, e);
                        }}
                        disabled={index === images.length - 1}
                        style={{ opacity: index === images.length - 1 ? 0.5 : 1 }}
                      >
                        <ArrowDown size={16} />
                      </motion.button>
                    </div>
                    
                    {/* Botón para expandir */}
                    <motion.button
                      className="p-2 bg-gray-800/90 shadow-md text-white rounded-full"
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageExpand(index, e);
                      }}
                    >
                      <Maximize2 size={16} />
                    </motion.button>
                    
                    {/* Botón para eliminar */}
                    <motion.button
                      className="p-2 bg-red-500/90 shadow-md text-white rounded-full"
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageRemove(index, e);
                      }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                  
                  {/* Texto de ayuda */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <p className="text-xs text-gray-800 bg-white/70 px-3 py-1 rounded-full">
                      Toca fuera para cerrar
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default MobileGallery;
