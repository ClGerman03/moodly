"use client";

import React from "react";
import { motion } from "framer-motion";
import TextArea from "../popups/imagefeedback/shared/CommentForm";

interface CommentSectionProps {
  /**
   * ID del elemento al que se está agregando comentarios
   * @deprecated No se utiliza actualmente pero se mantiene por compatibilidad
   */
  itemId?: string;
  
  /**
   * Comentario actual en el editor
   */
  currentComment: string;
  
  /**
   * Función para actualizar el comentario actual
   */
  setCurrentComment: (comment: string) => void;
  
  /**
   * Función para enviar el comentario
   */
  onSubmitComment: () => void;
  
  /**
   * Función para cancelar el comentario
   */
  onCancelComment: () => void;
  
  /**
   * Lista de comentarios existentes para este elemento
   */
  existingComments: Array<{
    itemId: string;
    comment: string;
    timestamp: string;
  }>;
  
  /**
   * Título para la sección de comentarios
   */
  title?: string;
}

/**
 * Componente reutilizable para la sección de comentarios
 * Se puede usar en cualquier tipo de sección de feedback
 */
const CommentSection: React.FC<CommentSectionProps> = ({
  // itemId se incluye pero no se utiliza
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  itemId,
  currentComment,
  setCurrentComment,
  onSubmitComment,
  onCancelComment,
  existingComments,
  title = "Añadir comentario"
}) => {
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-gray-50/80 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm"
      >
        <h4 className="text-sm font-light text-gray-600 dark:text-gray-300 mb-3">
          {title}
        </h4>
        <div className="w-full p-3 bg-white dark:bg-gray-700/50 border-0 rounded-xl shadow-sm h-24 transition-all duration-200">
          <TextArea 
            value={currentComment}
            onChange={(value) => setCurrentComment(value)}
            placeholder="Escribe tu comentario..."
            autoFocus
          />
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button 
            onClick={onCancelComment}
            className="px-2.5 py-1 text-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-colors duration-200"
          >
            Cancelar
          </button>
          <button 
            onClick={onSubmitComment}
            disabled={!currentComment.trim()}
            className={`px-2.5 py-1 text-xs rounded-full transition-all duration-200 ${
              currentComment.trim() 
                ? 'bg-black/90 text-white hover:bg-black shadow-sm' 
                : 'bg-gray-200/80 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Guardar
          </button>
        </div>
      </motion.div>
      
      {existingComments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-light text-gray-500 dark:text-gray-400 mb-2">
            Comentarios:
          </h4>
          <div className="space-y-2">
            {existingComments.map((comment, idx) => (
              <div 
                key={idx}
                className="p-3 bg-white/80 dark:bg-gray-750/30 border-0 shadow-sm rounded-xl text-sm text-gray-600 dark:text-gray-300"
              >
                {comment.comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
