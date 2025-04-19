"use client";

import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { useImageFeedback } from "../../hooks/useImageFeedback";
import TextArea from "./shared/CommentForm";
import ImageViewer from "./shared/ImageViewer";
import ConfirmationMessage from "../../shared/ConfirmationMessage";

interface ImageFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  onSubmitComment?: (comment: string) => void;
  existingComments?: Array<{imageUrl: string, comment: string, timestamp: string}>;
}

/**
 * Componente para mostrar una imagen y permitir feedback en formato texto
 * Diseño minimalista con fondo transparente y bordes redondeados
 */
const ImageFeedbackPopup: React.FC<ImageFeedbackPopupProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle = "",
  imageTags = [],
  onSubmitComment,
  existingComments = []
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Usar el hook compartido para la lógica de comentarios
  const { comment, handleCommentChange } = useImageFeedback('', (text) => {
    if (onSubmitComment) {
      onSubmitComment(text);
    }
  });

  // Estado para controlar cuando mostrar el botón de envío
  const [showSendButton, setShowSendButton] = useState(false);
  
  // Estado para controlar cuando el feedback ha sido enviado
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Filtrar comentarios que pertenecen a esta imagen (solo para referencia)
  const imageComments = existingComments.filter(c => c.imageUrl === imageUrl);
  
  // Determinar si hay comentarios previos para esta imagen
  const hasExistingComments = imageComments.length > 0;

  // Función para manejar el envío del comentario
  const handleSubmit = () => {
    if (comment.trim() && onSubmitComment) {
      onSubmitComment(comment);
      handleCommentChange(''); // Limpiar el textarea después de enviar
      setShowSendButton(false);
      setFeedbackSent(true);
      
      // Cerrar automáticamente después de mostrar el mensaje
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  // Resetear el estado cuando se abre/cierra el popup
  useEffect(() => {
    if (isOpen) {
      setFeedbackSent(false);
    }
  }, [isOpen]);

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

            <AnimatePresence mode="wait">
              {feedbackSent ? (
                <motion.div
                  key="confirmation"
                  className="bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-sm p-8 w-full max-w-md mx-auto
                           border border-gray-100 dark:border-gray-700 backdrop-blur-sm flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ConfirmationMessage
                    title="Feedback enviado correctamente"
                    message="Gracias por tu aportación"
                    variant="success"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="feedback-content"
                  className="w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Usar el componente compartido ImageViewer */}
                  <ImageViewer 
                    imageUrl={imageUrl}
                    imageTitle={imageTitle}
                    imageTags={imageTags}
                  />

                  {/* Rectángulo para feedback de texto - más ligero */}
                  <motion.div
                    className="bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-sm p-4 w-full max-w-md mx-auto
                              border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Título minimalista */}
                    {imageTitle && (
                      <h3 className="text-base font-light text-gray-700 dark:text-gray-300 mb-3">
                        {imageTitle}
                      </h3>
                    )}

                    {/* Subtitle según estado */}
                    <h4 className="text-sm font-light text-gray-600 dark:text-gray-400 mb-3">
                      {hasExistingComments 
                        ? "This image already has feedback" 
                        : "Add your feedback about this image"}
                    </h4>

                    {/* Contenedor para TextArea y botón de envío */}
                    <div className="relative">
                      <TextArea
                        value={comment}
                        onChange={(value) => {
                          handleCommentChange(value);
                          setShowSendButton(value.trim().length > 0);
                        }}
                        autoFocus={true}
                        maxLength={300}
                        placeholder={hasExistingComments 
                          ? "Add additional feedback..." 
                          : "What do you think about this image?"}
                      />
                      
                      {/* Botón de envío independiente que aparece cuando hay texto */}
                      {showSendButton && (
                        <motion.button
                          className="absolute right-0 bottom-10 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300
                                  disabled:opacity-40 disabled:cursor-not-allowed p-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubmit}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          aria-label="Send feedback"
                        >
                          <Send size={18} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageFeedbackPopup;
