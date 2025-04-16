"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
 * Componente de feedback para ColorPalette
 * Muestra las paletas de colores y permite dar feedback sobre ellas
 */
const ColorPaletteFeedback: React.FC<ColorPaletteFeedbackProps> = ({
  section,
  onFeedback
}) => {
  // Estados para el manejo de paletas y feedback
  const [activePaletteIndex, setActivePaletteIndex] = useState<number>(0);
  const [userFeedback, setUserFeedback] = useState<Record<string, string>>({});
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
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
  
  // Función para manejar el feedback de una paleta completa
  const handlePaletteFeedback = (type: string) => {
    const paletteId = activePalette.id;
    
    // Actualizar el estado local
    setUserFeedback(prev => ({
      ...prev,
      [paletteId]: type
    }));
    
    // Enviar feedback al componente padre
    if (onFeedback) {
      onFeedback(section.id, {
        paletteFeedback: {
          paletteId,
          type,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Si es un comentario, mostrar el panel de comentarios
    if (type === 'comment') {
      setIsCommentMode(true);
    }
  };
  
  // Función para manejar el envío de un comentario
  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    
    const paletteId = activePalette.id;
    
    // Enviar comentario al componente padre
    if (onFeedback) {
      onFeedback(section.id, {
        paletteId,
        paletteComment: {
          comment,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Actualizar el estado local
    setUserFeedback(prev => ({
      ...prev,
      [paletteId]: 'comment'
    }));
    
    // Resetear estados
    setIsCommentMode(false);
    setComment("");
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-light text-gray-700 dark:text-gray-300">
            {activePalette.name}
          </h3>
          
          {/* Navegación entre paletas (puntos) */}
          {palettes.length > 1 && (
            <div className="flex space-x-1 ml-4">
              {palettes.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActivePaletteIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === activePaletteIndex 
                    ? 'bg-gray-500 dark:bg-gray-300 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                  aria-label={`Ver paleta ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Información de colores */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {activePalette.colors.length} colores
        </div>
      </div>
      
      {/* Navegación entre paletas (flechas) */}
      {palettes.length > 1 && (
        <div className="flex justify-between mb-3">
          <motion.button 
            onClick={() => handlePaletteChange(activePaletteIndex - 1)}
            className={`p-1 rounded-full ${activePaletteIndex === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            whileTap={activePaletteIndex > 0 ? { scale: 0.9 } : undefined}
            disabled={activePaletteIndex === 0}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <motion.button 
            onClick={() => handlePaletteChange(activePaletteIndex + 1)}
            className={`p-1 rounded-full ${activePaletteIndex === palettes.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            whileTap={activePaletteIndex < palettes.length - 1 ? { scale: 0.9 } : undefined}
            disabled={activePaletteIndex === palettes.length - 1}
          >
            <ArrowRight size={20} />
          </motion.button>
        </div>
      )}
      
      {/* Visualización de la paleta con soporte para deslizamiento */}
      <motion.div 
        className="grid gap-4 mb-6"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleSwipe}
      >
        <div 
          className="relative flex rounded-xl overflow-hidden h-20 sm:h-24 shadow-sm"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${activePalette.colors.length}, 1fr)` 
          }}
        >
          {activePalette.colors.map((color, index) => (
            <motion.div 
              key={index}
              className="relative"
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.02 }}
            >
              {/* No hay interacción individual con los colores */}
            </motion.div>
          ))}
          
          {/* Indicador de feedback para toda la paleta */}
          {userFeedback[activePalette.id] && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/50 text-white">
              {userFeedback[activePalette.id] === 'positive' && <ThumbsUp size={12} />}
              {userFeedback[activePalette.id] === 'negative' && <ThumbsDown size={12} />}
              {userFeedback[activePalette.id] === 'comment' && <MessageSquare size={12} />}
            </div>
          )}
        </div>
        
        {/* Botones de feedback para toda la paleta */}
        <div className="flex justify-center gap-3 mt-2">
          <motion.button 
            className="bg-black/70 text-white p-2 rounded-full"
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePaletteFeedback('positive')}
          >
            <ThumbsUp size={16} strokeWidth={1.5} />
          </motion.button>
          <motion.button 
            className="bg-black/70 text-white p-2 rounded-full"
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePaletteFeedback('negative')}
          >
            <ThumbsDown size={16} strokeWidth={1.5} />
          </motion.button>
          <motion.button 
            className="bg-amber-400 text-black p-2 rounded-full"
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePaletteFeedback('comment')}
          >
            <MessageSquare size={16} strokeWidth={1.5} />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Panel de comentarios */}
      <AnimatePresence>
        {isCommentMode && (
          <motion.div 
            className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-5 mb-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex mb-3 items-center gap-2">
              <h4 className="font-light text-gray-800/80 dark:text-gray-200/80">
                Comentario sobre esta paleta de colores
              </h4>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario sobre este color..."
              className="w-full p-3 rounded-xl border-0 
                         bg-transparent text-gray-900 dark:text-gray-100
                         resize-none focus:outline-none focus:ring-0
                         transition-all placeholder-gray-500/50 dark:placeholder-gray-400/50"
              rows={3}
              maxLength={300}
              autoFocus
            />
            
            {/* Botones de acción */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500/70 dark:text-gray-400/70">
                {comment.length}/300
              </span>
              <div className="flex gap-2">
                <motion.button 
                  className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsCommentMode(false);
                    setComment("");
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button 
                  className="px-3 py-1 rounded-full bg-amber-400 text-black disabled:opacity-40"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitComment}
                  disabled={!comment.trim()}
                >
                  Enviar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sugerencias e información */}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        ¡Comparte tu opinión!
      </p>
      
      {/* Instrucciones adicionales para dispositivos móviles */}
      {isMobile && palettes.length > 1 && (
        <div className="mt-2 text-center text-xs text-gray-400">
          {activePaletteIndex + 1} de {palettes.length}
        </div>
      )}
    </div>
  );
};

export default ColorPaletteFeedback;
