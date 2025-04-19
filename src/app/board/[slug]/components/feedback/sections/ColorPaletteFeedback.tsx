"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Section } from "@/app/tablero/types";
import FeedbackButtons from "../shared/FeedbackButtons";
import { useSectionFeedback } from "../hooks/useSectionFeedback";
import CommentSection from "../shared/CommentSection";
import { cn } from "@/lib/utils";

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

interface ColorPaletteFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente presentacional para mostrar una paleta de colores
 */
interface ColorPaletteDisplayProps {
  palette: ColorPalette;
  isMobile: boolean;
  onSwipe: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

const ColorPaletteDisplay: React.FC<ColorPaletteDisplayProps> = ({ 
  palette, 
  isMobile,
  onSwipe
}) => {
  return (
    <motion.div 
      key={palette.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
      drag={isMobile ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onSwipe}
      whileTap={isMobile ? { cursor: "grabbing" } : undefined}
    >
      <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Bento box grid layout - replicando el diseño de ColorPalette.tsx */}
        <div className="bento-grid p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {palette.colors.map((color, index) => {
            // Determine the size of this color cell (some larger than others for visual interest)
            const isLarge = index === 0 || index === 3; // First and fourth colors are larger
            const gridClass = isLarge 
              ? "col-span-2 row-span-2" 
              : "col-span-1 row-span-1";
            
            return (
              <motion.div 
                key={`${index}-${color}`}
                className={cn(
                  "relative group min-h-[60px]",
                  gridClass
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
              >
                <motion.div
                  className={cn(
                    "w-full h-full rounded-xl shadow-sm relative overflow-hidden flex items-end justify-center",
                    isLarge ? "min-h-[120px]" : "min-h-[60px]"
                  )}
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Color hex code tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-black/30 w-full flex justify-center backdrop-blur-sm">
                    <span className="text-[10px] text-white/90 uppercase tracking-wider font-medium">
                      {color.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Componente principal que conecta la presentación con la lógica de feedback
 */
const ColorPaletteFeedback: React.FC<ColorPaletteFeedbackProps> = ({
  section,
  onFeedback
}) => {
  // Estados para el manejo de paletas
  const [activePaletteIndex, setActivePaletteIndex] = useState<number>(0);
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Utilizar el hook común para gestión de feedback
  const {
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });
  
  // Obtener las paletas del section
  const palettes = useMemo(() => {
    return section.data?.palettes as ColorPalette[] || [];
  }, [section.data?.palettes]);
  
  // Detectar si estamos en dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Si no hay paletas, mostrar un mensaje
  if (!palettes.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene paletas de color
      </div>
    );
  }
  
  // Obtener la paleta activa
  const activePalette = palettes[activePaletteIndex];
  
  // Función para manejar el cambio de paleta
  const handlePaletteChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < palettes.length) {
      setActivePaletteIndex(newIndex);
      // Resetear estados al cambiar de paleta
      setIsCommentMode(false);
    }
  };
  
  // Manejar deslizamiento para navegar entre paletas en móvil
  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return;
    
    // Detectar dirección del deslizamiento (izquierda o derecha)
    if (info.offset.x < -50) { // Deslizamiento hacia la izquierda -> siguiente paleta
      handlePaletteChange(activePaletteIndex + 1);
    } else if (info.offset.x > 50) { // Deslizamiento hacia la derecha -> paleta anterior
      handlePaletteChange(activePaletteIndex - 1);
    }
  };
  
  // Handler específico para feedback de paletas
  const handlePaletteFeedback = (type: string) => {
    const paletteId = activePalette.id;
    
    // Si es comentario, mostrar el panel de comentarios
    if (type === 'comment') {
      setIsCommentMode(true);
      return;
    }
    
    // Usar nuestro hook para gestionar el feedback
    handleItemFeedback(paletteId, type as any);
  };
  
  // Handler específico para enviar comentarios de paletas
  const handlePaletteCommentSubmit = () => {
    if (!currentComment.trim()) return;
    
    // Usar nuestro hook para enviar el comentario
    handleSubmitComment();
    
    // Resetear UI
    setIsCommentMode(false);
  };
  
  // Handler para cancelar comentario
  const handleCancelComment = () => {
    cancelComment();
    setIsCommentMode(false);
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-light text-gray-700 dark:text-gray-300">
            {activePalette.name}
          </h3>
        </div>
        
        {/* Navegación entre paletas */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handlePaletteChange(activePaletteIndex - 1)}
            disabled={activePaletteIndex === 0}
            className={`p-2 rounded-full ${
              activePaletteIndex === 0 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Paleta anterior"
          >
            <ArrowLeft size={16} />
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activePaletteIndex + 1} / {palettes.length}
          </span>
          
          <button 
            onClick={() => handlePaletteChange(activePaletteIndex + 1)}
            disabled={activePaletteIndex === palettes.length - 1}
            className={`p-2 rounded-full ${
              activePaletteIndex === palettes.length - 1 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Siguiente paleta"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Componente presentacional para la paleta */}
      <ColorPaletteDisplay 
        palette={activePalette}
        isMobile={isMobile}
        onSwipe={handleSwipe}
      />
      
      {/* Panel de feedback */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {isCommentMode ? (
            <CommentSection
              itemId={activePalette.id}
              currentComment={currentComment}
              setCurrentComment={setCurrentComment}
              onSubmitComment={handlePaletteCommentSubmit}
              onCancelComment={handleCancelComment}
              existingComments={getItemComments(activePalette.id)}
              title="Añadir comentario sobre esta paleta"
            />
          ) : (
            <motion.div 
              key="feedback-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">
                ¿Qué te parece esta paleta de colores?
              </div>
              <FeedbackButtons 
                onFeedback={handlePaletteFeedback}
                currentFeedback={getItemFeedback(activePalette.id)}
                useMessageIcon={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ColorPaletteFeedback;
