"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

interface ColorPaletteSummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Componente especializado para mostrar el resumen de feedback de paletas de colores
 */
const ColorPaletteSummary: React.FC<ColorPaletteSummaryProps> = ({
  section,
  normalizedFeedback
}) => {
  // Obtener todas las paletas con reacciones
  const palettesWithFeedback = normalizedFeedback.reactions.map(r => r.id);
  
  // Agrupar comentarios por paleta
  const commentsByPalette: Record<string, string[]> = {};
  normalizedFeedback.comments.forEach(comment => {
    if (!commentsByPalette[comment.id]) {
      commentsByPalette[comment.id] = [];
    }
    commentsByPalette[comment.id].push(comment.comment);
  });
  
  // Obtener todas las paletas únicas que tienen feedback o comentarios
  const allFeedbackPalettes = Array.from(
    new Set([
      ...palettesWithFeedback,
      ...Object.keys(commentsByPalette)
    ])
  );
  
  // Obtener las paletas del section data
  const palettes = (section.data?.palettes || []) as ColorPalette[];
  
  // Helper para obtener paleta por ID
  const getPalette = (paletteId: string): ColorPalette | undefined => {
    return palettes.find(p => p.id === paletteId);
  };
  
  // Obtener el tipo de reacción para una paleta
  const getReactionType = (paletteId: string) => {
    const reaction = normalizedFeedback.reactions.find(r => r.id === paletteId);
    return reaction?.type;
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackPalettes.map((paletteId) => {
        const palette = getPalette(paletteId);
        if (!palette) return null;
        
        return (
          <div key={paletteId} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {palette.name}
              </h4>
              
              <div className="ml-3">
                {getReactionType(paletteId) === 'positive' && (
                  <div className="flex items-center text-green-500">
                    <ThumbsUp size={14} className="mr-1" />
                    <span className="text-xs">Positivo</span>
                  </div>
                )}
                {getReactionType(paletteId) === 'negative' && (
                  <div className="flex items-center text-red-500">
                    <ThumbsDown size={14} className="mr-1" />
                    <span className="text-xs">Negativo</span>
                  </div>
                )}
                {getReactionType(paletteId) === 'comment' && (
                  <div className="flex items-center text-amber-500">
                    <MessageSquare size={14} className="mr-1" />
                    <span className="text-xs">Comentado</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Visualización de colores de la paleta */}
            <div className="flex overflow-hidden rounded-md mb-2 h-8">
              {palette.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
            
            {/* Comentarios sobre esta paleta */}
            {commentsByPalette[paletteId] && commentsByPalette[paletteId].length > 0 && (
              <div className="mt-2">
                {commentsByPalette[paletteId].map((comment, idx) => (
                  <div 
                    key={idx} 
                    className="mb-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div className="flex items-center mb-1 text-gray-500">
                      <MessageSquare size={12} className="mr-1" />
                      <span className="text-xs">Comentario{commentsByPalette[paletteId].length > 1 ? ` ${idx + 1}` : ''}:</span>
                    </div>
                    &ldquo;{comment}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ColorPaletteSummary;
