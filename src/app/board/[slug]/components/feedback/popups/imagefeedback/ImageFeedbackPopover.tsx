"use client";

import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useImageFeedback } from "../../hooks/useImageFeedback";
import CommentForm from "./shared/CommentForm";
import ImageViewer from "./shared/ImageViewer";

interface ImageFeedbackPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  onSubmitComment?: (comment: string) => void;
}

/**
 * Componente para mostrar comentarios de imágenes en formato PopOver (versión desktop)
 * Diseñado para aparecer en el lado derecho de la pantalla
 */
const ImageFeedbackPopover: React.FC<ImageFeedbackPopoverProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle = "",
  imageTags = [],
  onSubmitComment,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Usar el hook compartido para la lógica de comentarios
  const { comment, handleCommentChange, handleSubmitComment } = useImageFeedback('', (text) => {
    if (onSubmitComment) {
      onSubmitComment(text);
    }
  });

  // Manejar clic fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-6">
          {/* Backdrop semitransparente */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Contenedor lateral (popover) */}
          <motion.div
            ref={popoverRef}
            className="relative z-10 h-[90vh] flex flex-col bg-white dark:bg-gray-900 shadow-xl w-[450px] max-w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Botón cerrar en la esquina superior derecha */}
            <motion.button
              className="absolute top-5 right-5 bg-black/70 text-white p-2 rounded-full z-20
                         hover:bg-black/80 transition-colors shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </motion.button>

            {/* Contenido del popover */}
            <div className="flex flex-col h-full p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Título de la imagen si existe */}
              {imageTitle && (
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {imageTitle}
                </h3>
              )}

              {/* Imagen - versión más pequeña que en mobile */}
              <ImageViewer 
                imageUrl={imageUrl}
                imageTitle={imageTitle}
                imageTags={imageTags}
                isPopover={true}
              />
              
              {/* Separador */}
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

              {/* Sección de comentarios */}
              <div className="rounded-lg py-3 px-1">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Leave your feedback</h4>
                
                <CommentForm
                  comment={comment}
                  onCommentChange={handleCommentChange}
                  onSubmitComment={handleSubmitComment}
                  autoFocus={true}
                  maxLength={300}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageFeedbackPopover;
