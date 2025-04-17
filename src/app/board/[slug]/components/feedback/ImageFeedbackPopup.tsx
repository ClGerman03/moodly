"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import ImageTags from "./ImageTags";

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
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [comment, setComment] = React.useState("");

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

  // Enfocar el textarea cuando se abre el popup
  useEffect(() => {
    if (isOpen && commentRef.current) {
      setTimeout(() => {
        commentRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSubmitComment = () => {
    if (comment.trim() && onSubmitComment) {
      onSubmitComment(comment);
      setComment("");
    }
  };

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

            {/* Imagen con bordes redondeados */}
            <motion.div 
              className="relative mb-4 rounded-xl overflow-hidden shadow-xl"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <Image
                  src={imageUrl}
                  alt={imageTitle || "Selected image"}
                  width={800}
                  height={600}
                  className="rounded-xl max-h-[70vh] w-auto object-contain bg-white/5"
                  style={{ objectFit: 'contain' }}
                  priority
                  unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
                />
                
                {/* Mostrar etiquetas si existen */}
                {imageTags && imageTags.length > 0 && (
                  <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-xl">
                    <ImageTags tags={imageTags} />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Rectángulo horizontal para comentarios */}
            <motion.div
              className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-5 w-full
                       border-0 backdrop-blur-sm"
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

              {/* Área de comentario */}
              <div className="relative">
                <textarea
                  ref={commentRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment about this image..."
                  className="w-full p-3 rounded-xl border-0 
                           bg-transparent text-gray-900 dark:text-gray-100
                           resize-none focus:outline-none focus:ring-0
                           transition-all placeholder-gray-500/50 dark:placeholder-gray-400/50"
                  rows={3}
                  maxLength={500}
                />
                
                {/* Contador de caracteres y botón enviar más minimalista */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500/70 dark:text-gray-400/70">
                    {comment.length}/500
                  </span>
                  <motion.button
                    className="bg-amber-400 text-black p-2 rounded-full
                             hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitComment}
                    disabled={!comment.trim()}
                    aria-label="Send comment"
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageFeedbackPopup;
