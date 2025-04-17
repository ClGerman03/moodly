"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface CommentFormProps {
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  autoFocus?: boolean;
  maxLength?: number;
}

/**
 * Componente reutilizable para el formulario de comentarios
 */
const CommentForm: React.FC<CommentFormProps> = ({
  comment,
  onCommentChange,
  onSubmitComment,
  autoFocus = false,
  maxLength = 300
}) => {
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Autoenfoque del textarea si es necesario
  useEffect(() => {
    if (autoFocus && commentRef.current) {
      setTimeout(() => {
        commentRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <textarea
        ref={commentRef}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Add a comment about this image..."
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 
                 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
                 resize-none focus:outline-none focus:ring-1 focus:ring-amber-300
                 transition-all placeholder-gray-500 dark:placeholder-gray-400"
        rows={2}
        maxLength={maxLength}
      />
      
      {/* Contador de caracteres y botón enviar más minimalista */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {comment.length}/{maxLength}
        </span>
        <motion.button
          className="bg-amber-400 text-black p-2 rounded-full shadow-sm
                   hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSubmitComment}
          disabled={!comment.trim()}
          aria-label="Send comment"
        >
          <Send size={14} />
        </motion.button>
      </div>
    </div>
  );
};

export default CommentForm;
