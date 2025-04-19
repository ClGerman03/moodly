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
        transition={{ duration: 0.3 }}
        className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
      >
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          {title}
        </h4>
        <div className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 h-24">
          <TextArea 
            value={currentComment}
            onChange={(value) => setCurrentComment(value)}
            placeholder="Escribe tu comentario..."
            autoFocus
          />
        </div>
        <div className="flex justify-end mt-3 gap-2">
          <button 
            onClick={onCancelComment}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-650"
          >
            Cancelar
          </button>
          <button 
            onClick={onSubmitComment}
            disabled={!currentComment.trim()}
            className={`px-3 py-1.5 text-sm rounded ${
              currentComment.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Guardar comentario
          </button>
        </div>
      </motion.div>
      
      {/* Mostrar comentarios existentes si hay */}
      {existingComments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Comentarios:
          </h4>
          <div className="space-y-2">
            {existingComments.map((comment, idx) => (
              <div 
                key={idx}
                className="p-3 bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300"
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
