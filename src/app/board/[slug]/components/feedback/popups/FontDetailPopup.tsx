"use client";

import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { PreviewSize } from "@/app/tablero/types";

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

interface FontDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  font: FontOption | null;
  previewSize: PreviewSize;
  previewText: string;
  onLike?: () => void;
  onDislike?: () => void;
  onSubmitComment?: (comment: string) => void;
  userFeedback?: 'positive' | 'negative' | null;
}

const fontSizeMappings = {
  sm: {
    heading: "text-xl md:text-2xl",
    subheading: "text-lg",
    body: "text-sm"
  },
  md: {
    heading: "text-2xl md:text-3xl",
    subheading: "text-xl",
    body: "text-base"
  },
  lg: {
    heading: "text-3xl md:text-4xl",
    subheading: "text-2xl",
    body: "text-lg"
  }
};

/**
 * Componente para mostrar detalles de una tipografía y permitir feedback
 * Diseño minimalista con fondo transparente y bordes redondeados
 */
const FontDetailPopup: React.FC<FontDetailPopupProps> = ({
  isOpen,
  onClose,
  font,
  previewSize,
  previewText,
  onLike,
  onDislike,
  onSubmitComment,
  userFeedback,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [comment, setComment] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"preview" | "weights">("preview");
  const [isCommentFocused, setIsCommentFocused] = React.useState(false);

  // Manejar clic fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Manejar tecla escape para cerrar
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmitComment = () => {
    if (comment.trim() && onSubmitComment) {
      onSubmitComment(comment);
      setComment("");
      setIsCommentFocused(false);
    }
  };

  // Si no está abierto o no hay fuente seleccionada, no renderizar nada
  if (!isOpen || !font) return null;

  // Obtener un peso medio para el texto de ejemplo
  const getTextWeight = (index: number): number => {
    if (index === 0) {
      // Para heading, usar el peso más alto disponible o 700
      return font.weights.includes(700) 
        ? 700 
        : font.weights.includes(600)
          ? 600
          : font.weights[font.weights.length - 1];
    } else if (index === 1) {
      // Para subheading, buscar peso medio (500 o 600)
      return font.weights.includes(500) 
        ? 500 
        : font.weights.includes(600)
          ? 600
          : font.weights[Math.min(1, font.weights.length - 1)];
    } 
    // Para texto normal, usar 400 o el peso más bajo
    return font.weights.includes(400) 
      ? 400 
      : font.weights[0];
  };

  // Diferentes vistas según el modo seleccionado
  const renderContent = () => {
    switch (viewMode) {
      case "weights":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {font.weights.map((weight) => (
              <div 
                key={weight}
                className="flex flex-col items-center p-4 bg-white/20 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm"
              >
                <span 
                  style={{ fontFamily: font.family, fontWeight: weight }}
                  className="text-5xl text-gray-800 dark:text-gray-200 mb-2"
                >
                  Aa
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {weight}
                </span>
              </div>
            ))}
          </div>
        );

      default: // "preview"
        return (
          <div className="mt-4 space-y-6">
            <div 
              style={{ fontFamily: font.family, fontWeight: getTextWeight(0) }} 
              className={`leading-tight ${fontSizeMappings[previewSize].heading}`}
            >
              El arte de la tipografía
            </div>
            
            <div 
              style={{ fontFamily: font.family, fontWeight: getTextWeight(1) }} 
              className={`leading-snug ${fontSizeMappings[previewSize].subheading}`}
            >
              Diseño y comunicación visual
            </div>
            
            <div 
              style={{ fontFamily: font.family, fontWeight: getTextWeight(2) }} 
              className={`leading-relaxed ${fontSizeMappings[previewSize].body}`}
            >
              {previewText}
            </div>
            
            <div className="pt-4 space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span> {font.category}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Pesos disponibles:</span> {font.weights.join(", ")}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Background con blur para mantener visibilidad del contexto */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Contenedor principal con diseño minimalista */}
          <motion.div
            ref={popupRef}
            className="relative z-10 flex flex-col max-w-2xl w-full"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Botón cerrar en la esquina superior derecha */}
            <motion.button
              className="absolute -top-3 -right-3 bg-black/70 text-white p-2 rounded-full z-20
                         hover:bg-black/80 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={16} />
            </motion.button>

            {/* Contenido principal */}
            <motion.div
              className="bg-white/90 dark:bg-gray-800/90 rounded-t-2xl shadow-lg p-6 w-full
                       border-0 backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Encabezado con nombre de la fuente */}
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  {font.name}
                </h2>
                
                {/* Botones de feedback */}
                <div className="flex items-center gap-2">
                  <motion.button
                    className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
                      userFeedback === 'positive'
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLike}
                    aria-label="Me gusta"
                  >
                    <ThumbsUp size={16} />
                  </motion.button>
                  
                  <motion.button
                    className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
                      userFeedback === 'negative'
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDislike}
                    aria-label="No me gusta"
                  >
                    <ThumbsDown size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Pestañas para cambiar de vista */}
              <div className="flex border-b border-gray-200/50 dark:border-gray-700/30 mt-3 mb-4">
                <button
                  className={`pb-2 px-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    viewMode === "preview"
                      ? "border-amber-400 text-gray-900 dark:text-gray-100"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                  onClick={() => setViewMode("preview")}
                >
                  Vista previa
                </button>
                <button
                  className={`pb-2 px-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    viewMode === "weights"
                      ? "border-amber-400 text-gray-900 dark:text-gray-100"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                  onClick={() => setViewMode("weights")}
                >
                  Pesos
                </button>
              </div>

              {/* Contenido según el modo seleccionado */}
              {renderContent()}
            </motion.div>

            {/* Sección de comentarios separada en un rectángulo horizontal abajo */}
            <motion.div
              className="bg-amber-50/90 dark:bg-amber-950/40 rounded-b-2xl shadow-lg p-4 w-full
                       border-t border-amber-100 dark:border-amber-900/30 backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isCommentFocused ? (
                <div className="relative">
                  <textarea
                    ref={commentRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="¿Qué opinas sobre esta tipografía?"
                    className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-800/50
                             bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100
                             resize-none focus:outline-none focus:ring-2 focus:ring-amber-400
                             transition-all placeholder-gray-500/60 dark:placeholder-gray-400/60"
                    rows={3}
                    maxLength={500}
                    autoFocus
                    onBlur={() => !comment && setIsCommentFocused(false)}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500/80 dark:text-gray-400/80">
                      {comment.length}/500
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                 px-3 py-1.5 rounded-lg text-sm transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setComment("");
                          setIsCommentFocused(false);
                        }}
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        className="bg-amber-400 text-black px-3 py-1.5 text-sm rounded-lg
                                 hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitComment}
                        disabled={!comment.trim()}
                      >
                        <Send size={14} /> Enviar
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                           bg-white/50 dark:bg-gray-800/50 border border-amber-200/50 dark:border-amber-800/30
                           text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80
                           transition-all text-sm"
                  onClick={() => setIsCommentFocused(true)}
                >
                  <MessageSquare size={16} />
                  <span>Añadir un comentario sobre esta tipografía</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FontDetailPopup;
