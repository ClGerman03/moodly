"use client";

import React from 'react';
import { PenTool, ThumbsUp, ThumbsDown } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface TextSummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Componente especializado para mostrar el resumen de feedback de secciones de texto
 */
const TextSummary: React.FC<TextSummaryProps> = ({
  section,
  normalizedFeedback
}) => {
  // Obtener la reacción general del texto
  const textReaction = normalizedFeedback.reactions.find(r => r.id === 'text');
  
  // Obtener todos los comentarios
  const comments = normalizedFeedback.comments.map(c => c.comment);
  
  return (
    <div>
      {/* Mostrar la reacción general */}
      {textReaction && (
        <div className="mb-4 flex items-center">
          {textReaction.type === 'positive' ? (
            <div className="flex items-center text-green-500">
              <ThumbsUp size={16} className="mr-2" />
              <span>Positivo</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <ThumbsDown size={16} className="mr-2" />
              <span>Negativo</span>
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar los comentarios */}
      {comments.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comentarios:
          </h4>
          <div className="space-y-2">
            {comments.map((comment, idx) => (
              <div 
                key={idx} 
                className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
              >
                <div className="flex items-center mb-1 text-gray-500">
                  <PenTool size={12} className="mr-1" />
                  <span className="text-xs">Comentario{comments.length > 1 ? ` ${idx + 1}` : ''}:</span>
                </div>
                "{comment}"
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Si no hay feedback */}
      {!textReaction && comments.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No se proporcionó feedback para esta sección de texto.
        </div>
      )}
    </div>
  );
};

export default TextSummary;
