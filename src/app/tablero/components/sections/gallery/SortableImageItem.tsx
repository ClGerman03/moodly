"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Trash2, GripVertical, Edit, Type, Keyboard, PenTool } from "lucide-react";
import { ImageMetadata } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableImageItemProps {
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
}

/**
 * Componente para una imagen con soporte para arrastrar y soltar
 */
const SortableImageItem: React.FC<SortableImageItemProps> = ({
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
          {/* Controles superiores */}
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
          
          {/* Botón para editar metadata - posicionado en la parte inferior derecha con estilo amarillo */}
          <motion.button
            className="absolute bottom-2 right-2 p-2 bg-yellow-400 shadow-sm text-black rounded-full z-10"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(250, 204, 21, 1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleButtonClick(e, onExpand)}
          >
            <PenTool size={18} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SortableImageItem;
