"use client";

import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useImageFeedback } from "../../hooks/useImageFeedback";
import CommentForm from "./shared/CommentForm";
import ImageViewer from "./shared/ImageViewer";

interface ImageFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  onSubmitComment?: (comment: string) => void;
}

/**
 * Componente para mostrar una imagen y permitir comentarios en modo feedback
 * Diseño minimalista con fondo transparente y bordes redondeados
 */
const ImageFeedbackPopup: React.FC<ImageFeedbackPopupProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle = "",
  imageTags = [],
  onSubmitComment,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Usar el hook compartido para la lógica de comentarios
  const { comment, handleCommentChange, handleSubmitComment } = useImageFeedback('', (text) => {
    if (onSubmitComment) {
      onSubmitComment(text);
    }
  });

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

  // No necesitamos el efecto para enfocar el textarea aquí
  // ya que eso lo maneja ahora el componente CommentForm

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* No backdrop con blur para mantener visibilidad del contexto */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Contenedor principal con diseño minimalista */}
          <motion.div
            ref={popupRef}
            className="relative z-10 flex flex-col items-center max-w-3xl w-full"
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
              aria-label="Close"
            >
              <X size={16} />
            </motion.button>

            {/* Usar el componente compartido ImageViewer */}
            <ImageViewer 
              imageUrl={imageUrl}
              imageTitle={imageTitle}
              imageTags={imageTags}
            />

            {/* Rectángulo horizontal para comentarios */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto
                       border border-gray-100 dark:border-gray-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Título de la imagen si existe - más ligero y transparente */}
              {imageTitle && (
                <h3 className="text-lg font-light text-gray-800/80 dark:text-gray-200/80 mb-3 tracking-wide">
                  {imageTitle}
                </h3>
              )}

              {/* Usar el componente compartido CommentForm */}
              <CommentForm
                comment={comment}
                onCommentChange={handleCommentChange}
                onSubmitComment={handleSubmitComment}
                autoFocus={true}
                maxLength={300}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageFeedbackPopup;
