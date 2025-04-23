"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Section, PreviewSize } from "@/app/tablero/types";
import FeedbackButtons from "../shared/FeedbackButtons";
import FeedbackIndicator from "../shared/FeedbackIndicator";
import { useSectionFeedback } from "../hooks/useSectionFeedback";
import CommentSection from "../shared/CommentSection";

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

interface TypographyFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente presentacional para mostrar una tipografía
 */
interface FontDisplayProps {
  font: FontOption;
  previewText: string;
  previewSize: PreviewSize;
  isMobile: boolean;
  onSwipe: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

const FontDisplay: React.FC<FontDisplayProps> = ({ 
  font, 
  previewText,
  previewSize,
  isMobile,
  onSwipe
}) => {
  // Determinar tamaños de texto basados en previewSize
  const headingSize = useMemo(() => {
    switch(previewSize) {
      case "sm": return "text-3xl";
      case "lg": return "text-5xl";
      case "md":
      default: return "text-4xl";
    }
  }, [previewSize]);

  const bodySize = useMemo(() => {
    switch(previewSize) {
      case "sm": return "text-sm";
      case "lg": return "text-lg";
      case "md":
      default: return "text-base";
    }
  }, [previewSize]);

  return (
    <motion.div 
      key={font.id}
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
      <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20 p-6">
        {/* Header with font metadata */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
              {font.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
              {font.category} · {font.weights.length} {font.weights.length === 1 ? "weight" : "weights"}
            </p>
          </div>
        </div>

        {/* Font preview */}
        <div 
          style={{ fontFamily: font.family }} 
          className="mt-6 mb-4 overflow-hidden"
        >
          <div 
            style={{ fontWeight: font.weights[0] || 700 }} 
            className={`${headingSize} text-gray-800 dark:text-gray-200 mb-3`}
          >
            Aa Bb Cc
          </div>
          <div 
            style={{ fontWeight: font.weights.includes(400) ? 400 : font.weights[0] || 300 }} 
            className={`${bodySize} text-gray-600 dark:text-gray-400 leading-relaxed`}
          >
            {previewText}
          </div>
        </div>

        {/* Weight samples */}
        {font.weights.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Available weights:</p>
            <div className="flex flex-wrap gap-3">
              {font.weights.map(weight => (
                <div 
                  key={weight} 
                  style={{ fontFamily: font.family, fontWeight: weight }}
                  className="text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                >
                  {weight}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Componente principal que conecta la presentación con la lógica de feedback
 */
const TypographyFeedback: React.FC<TypographyFeedbackProps> = ({
  section,
  onFeedback
}) => {
  // Estados para el manejo de tipografías
  const [activeFontIndex, setActiveFontIndex] = useState<number>(0);
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
  
  // Obtener las tipografías del section
  const fonts = useMemo(() => {
    return section.data?.fonts as FontOption[] || [];
  }, [section.data?.fonts]);

  // Obtener textos de muestra y tamaño del section
  const previewText = useMemo(() => {
    return section.data?.previewText || "Typography is the art and technique of arranging type to make written language legible, readable, and appealing.";
  }, [section.data?.previewText]);

  const previewSize = useMemo(() => {
    return (section.data?.previewSize as PreviewSize) || "md";
  }, [section.data?.previewSize]);
  
  // Tipografía actualmente activa
  const activeFont = useMemo(() => {
    return fonts[activeFontIndex] || null;
  }, [fonts, activeFontIndex]);
  
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
  
  // Función para manejar el cambio de tipografía
  const handleFontChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= fonts.length) return;
    
    setActiveFontIndex(newIndex);
    setIsCommentMode(false);
  };

  // Manejar deslizamiento para navegar entre tipografías en móvil
  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    // Si el deslizamiento es suficientemente largo en X (horizontal)
    if (Math.abs(offset.x) > 100) {
      // Deslizamiento a la derecha (anterior)
      if (offset.x > 0 && activeFontIndex > 0) {
        handleFontChange(activeFontIndex - 1);
      } 
      // Deslizamiento a la izquierda (siguiente)
      else if (offset.x < 0 && activeFontIndex < fonts.length - 1) {
        handleFontChange(activeFontIndex + 1);
      }
    }
  };
  
  // Handler específico para feedback de tipografías
  const handleFontFeedback = (type: 'positive' | 'negative' | 'comment') => {
    if (!activeFont) return;
    
    const fontId = activeFont.id;
    
    if (type === 'comment') {
      setIsCommentMode(true);
      // El hook useSectionFeedback lo manejará cuando pasemos el tipo 'comment'
      handleItemFeedback(fontId, 'comment');
      return;
    }
    
    // Usar nuestro hook para gestionar el feedback
    handleItemFeedback(fontId, type);
  };
  
  // Handler específico para enviar comentarios de tipografías
  const handleFontCommentSubmit = () => {
    if (!currentComment.trim() || !activeFont) return;
    
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
  
  // Si no hay tipografías, mostrar un mensaje
  if (!fonts.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        This board contains no typography
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-light text-gray-700 dark:text-gray-300">
            {activeFont.name}
          </h3>
          
          {/* Indicador de feedback para la tipografía actual */}
          {(getItemFeedback(activeFont.id) || getItemComments(activeFont.id).length > 0) && (
            <FeedbackIndicator 
              type={getItemFeedback(activeFont.id) || 'hasComments'}
              hasComments={getItemComments(activeFont.id).length > 0}
              size={16}
              className="shadow-md"
            />
          )}
        </div>
        
        {/* Navegación entre tipografías */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleFontChange(activeFontIndex - 1)}
            disabled={activeFontIndex === 0}
            className={`p-2 rounded-full ${
              activeFontIndex === 0 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Previous font"
          >
            <ArrowLeft size={16} />
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeFontIndex + 1} / {fonts.length}
          </span>
          
          <button 
            onClick={() => handleFontChange(activeFontIndex + 1)}
            disabled={activeFontIndex === fonts.length - 1}
            className={`p-2 rounded-full ${
              activeFontIndex === fonts.length - 1 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Next font"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Componente presentacional para la tipografía */}
      {activeFont && (
        <FontDisplay 
          font={activeFont}
          previewText={previewText}
          previewSize={previewSize}
          isMobile={isMobile}
          onSwipe={handleSwipe}
        />
      )}
      
      {/* Panel de feedback */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {isCommentMode ? (
            <CommentSection
              itemId={activeFont.id}
              currentComment={currentComment}
              setCurrentComment={setCurrentComment}
              onSubmitComment={handleFontCommentSubmit}
              onCancelComment={handleCancelComment}
              existingComments={getItemComments(activeFont.id)}
              title="Add a comment about this font"
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
                What do you think about this font?
              </div>
              <FeedbackButtons 
                onFeedback={handleFontFeedback}
                currentFeedback={getItemFeedback(activeFont.id)}
                useMessageIcon={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypographyFeedback;
