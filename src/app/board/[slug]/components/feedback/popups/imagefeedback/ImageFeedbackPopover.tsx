"use client";

import React, { useState, useEffect } from "react";
import { useImageFeedback } from "../../hooks/useImageFeedback";
import TextArea from "./shared/CommentForm";
import ImageViewer from "./shared/ImageViewer";
import SidePanel from "@/components/ui/SidePanel";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationMessage from "../../shared/ConfirmationMessage";

interface ImageFeedbackPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  onSubmitComment?: (comment: string) => void;
  existingComments?: Array<{imageUrl: string, comment: string, timestamp: string}>;
}

/**
 * Componente para mostrar comentarios de imágenes en formato PopOver (versión desktop)
 * Diseñado para aparecer en el lado derecho de la pantalla
 * Utiliza el componente reutilizable SidePanel
 */
const ImageFeedbackPopover: React.FC<ImageFeedbackPopoverProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle = "",
  imageTags = [],
  onSubmitComment,
  existingComments = []
}) => {
  // Usar el hook compartido para la lógica de comentarios
  const { comment, handleCommentChange } = useImageFeedback('', (text) => {
    if (onSubmitComment) {
      // Solo enviar el comentario, pero NO cerrar el panel
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
  
  // Resetear el estado cuando se abre/cierra el panel
  useEffect(() => {
    if (isOpen) {
      setFeedbackSent(false);
    }
  }, [isOpen]);

  return (
    <SidePanel 
      isOpen={isOpen}
      onClose={onClose}
      title={feedbackSent ? "" : imageTitle}
      width={450}
      position="right"
      showBackdrop={true}
    >
      <AnimatePresence mode="wait">
        <div className="flex flex-col h-full justify-start pt-0">
          <AnimatePresence mode="wait" initial={false}>
            {feedbackSent ? (
              <motion.div
                key="confirmation"
                className="flex items-center justify-center h-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
              >
                {/* Imagen - versión más pequeña que en desktop */}
                <ImageViewer 
                  imageUrl={imageUrl}
                  imageTitle={imageTitle}
                  imageTags={imageTags}
                  isPopover={true}
                />
                
                {/* Separador */}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

                {/* Sección para área de texto */}
                <div className="px-1">
                  <h4 className="text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                    {hasExistingComments 
                      ? "This image already has feedback" 
                      : "Add your feedback about this image"}
                  </h4>
                  
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatePresence>
    </SidePanel>
  );
};

export default ImageFeedbackPopover;
