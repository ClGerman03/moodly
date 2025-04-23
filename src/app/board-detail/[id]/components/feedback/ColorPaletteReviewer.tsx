"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";

// Importamos los tipos desde supabase.ts
import { SectionFeedback } from "@/types/supabase";

// Definimos la interfaz para las paletas de colores 
interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

interface ColorPaletteReviewerProps {
  section: Section;
  sectionData: SectionFeedback;
}

/**
 * Specialized component for displaying color palette feedback from a reviewer
 */
const ColorPaletteReviewer: React.FC<ColorPaletteReviewerProps> = ({
  section,
  sectionData
}) => {
  // Get all palettes from section data
  const palettes = (section.data?.palettes || []) as ColorPalette[];
  
  // Logs para depuración
  console.log('ColorPaletteReviewer: Datos recibidos:', { section, sectionData });
  
  // ADAPTACIÓN A NUEVA ESTRUCTURA DE DATOS
  // Extraer feedback de items (para reacciones)
  const feedbackItems = sectionData.feedbackItems || {};
  
  // Procesar todos los items que comienzan con 'palette-' para extraer reacciones
  const palettesWithFeedback: string[] = [];
  const paletteReactions: Record<string, string> = {};
  
  // Procesar las reacciones desde feedbackItems
  Object.entries(feedbackItems).forEach(([itemId, item]) => {
    if (itemId.startsWith('palette-') || itemId === 'default') {
      const paletteId = itemId;
      palettesWithFeedback.push(paletteId);
      if (item && item.reaction) {
        paletteReactions[paletteId] = item.reaction;
      }
    }
  });
  
  // Group comments by palette - adaptado a la nueva estructura
  const commentsByPalette: Record<string, { comment: string, timestamp: string }[]> = {};
  
  // Procesar comentarios desde la estructura comments
  if (sectionData.comments && sectionData.comments.length > 0) {
    sectionData.comments.forEach(comment => {
      const paletteId = comment.itemId;
      if (!commentsByPalette[paletteId]) {
        commentsByPalette[paletteId] = [];
      }
      commentsByPalette[paletteId].push({
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Get all unique palettes that have feedback or comments
  const allFeedbackPalettes = Array.from(
    new Set([
      ...palettesWithFeedback,
      ...Object.keys(commentsByPalette)
    ])
  );
  
  console.log('ColorPaletteReviewer: Paletas con feedback y comentarios:', {
    palettesWithFeedback,
    paletteReactions,
    commentsByPalette,
    allFeedbackPalettes
  });
  
  // Helper to get palette by ID
  const getPalette = (paletteId: string): ColorPalette | undefined => {
    return palettes.find(p => p.id === paletteId);
  };
  
  // Get reaction type for a palette - adaptado a nueva estructura
  const getReactionType = (paletteId: string) => {
    // Primero intentamos buscar en paletteReactions
    if (paletteReactions[paletteId]) {
      return paletteReactions[paletteId];
    }
    
    // Si no hay reacción pero hay comentarios, devolver 'neutral'
    if (commentsByPalette[paletteId] && commentsByPalette[paletteId].length > 0) {
      return 'neutral';
    }
    
    // Por defecto devolver 'neutral'
    return 'neutral';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackPalettes.length > 0 ? (
        allFeedbackPalettes.map(paletteId => {
          const palette = getPalette(paletteId);
          if (!palette) return null;
          
          return (
            <div key={paletteId} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
              <div className="flex flex-col">
                {/* Palette title and reaction */}
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {palette.name}
                  </h4>
                  <div>
                    {getReactionType(paletteId) === 'positive' && (
                      <div className="flex items-center text-green-500">
                        <ThumbsUp size={14} className="mr-1" />
                        <span className="text-xs">Positive</span>
                      </div>
                    )}
                    {getReactionType(paletteId) === 'negative' && (
                      <div className="flex items-center text-red-500">
                        <ThumbsDown size={14} className="mr-1" />
                        <span className="text-xs">Negative</span>
                      </div>
                    )}
                    {getReactionType(paletteId) === 'neutral' && commentsByPalette[paletteId] && (
                      <div className="flex items-center text-amber-500">
                        <MessageSquare size={14} className="mr-1" />
                        <span className="text-xs">Comment</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Visualization of palette colors */}
                <div className="flex overflow-hidden rounded-md mb-3 h-8">
                  {palette.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
                
                {/* Comments for this palette */}
                {commentsByPalette[paletteId] && commentsByPalette[paletteId].length > 0 && (
                  <div className="space-y-2">
                    {commentsByPalette[paletteId].map((comment, idx) => (
                      <div 
                        key={idx} 
                        className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md"
                      >
                        <p>&quot;{comment.comment}&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(comment.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-sm text-gray-500 italic py-2">
          No specific feedback for color palettes in this section.
        </div>
      )}
    </div>
  );
};

export default ColorPaletteReviewer;
