"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, PenTool } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';
import Image from 'next/image';

interface ImageGallerySummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Componente especializado para mostrar el resumen de feedback de galería de imágenes
 */
const ImageGallerySummary: React.FC<ImageGallerySummaryProps> = ({
  normalizedFeedback
}) => {
  // Obtener todas las imágenes que tienen feedback
  const imagesWithFeedback = normalizedFeedback.reactions.map(r => r.id);
  
  // Agrupar comentarios por imagen
  const commentsByImage: Record<string, string[]> = {};
  normalizedFeedback.comments.forEach(comment => {
    if (!commentsByImage[comment.id]) {
      commentsByImage[comment.id] = [];
    }
    commentsByImage[comment.id].push(comment.comment);
  });
  
  // Obtener todas las imágenes únicas que tienen feedback o comentarios
  const allFeedbackImages = Array.from(
    new Set([
      ...imagesWithFeedback,
      ...Object.keys(commentsByImage)
    ])
  );
  
  // Obtener el tipo de reacción para una imagen
  const getReactionType = (imageUrl: string) => {
    const reaction = normalizedFeedback.reactions.find(r => r.id === imageUrl);
    return reaction?.type;
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackImages.map((imageUrl, index) => (
        <div key={index} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
          <div className="relative h-32 w-32 mx-auto mb-2 overflow-hidden rounded-md">
            <Image 
              src={imageUrl}
              alt="Gallery image"
              fill
              sizes="128px"
              className="object-cover" 
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              {getReactionType(imageUrl) === 'positive' && (
                <div className="flex items-center text-green-500">
                  <ThumbsUp size={14} className="mr-1" />
                  <span className="text-sm">Positivo</span>
                </div>
              )}
              {getReactionType(imageUrl) === 'negative' && (
                <div className="flex items-center text-red-500">
                  <ThumbsDown size={14} className="mr-1" />
                  <span className="text-sm">Negativo</span>
                </div>
              )}
              {/* Mostrar indicador de comentario si no hay reacción específica */}
              {(!getReactionType(imageUrl) || getReactionType(imageUrl) === 'comment') && commentsByImage[imageUrl] && (
                <div className="flex items-center text-amber-500">
                  <PenTool size={14} className="mr-1" />
                  <span className="text-sm">Comentado</span>
                </div>
              )}
            </div>
            
            {/* Renderizar todos los comentarios asociados a esta imagen */}
            {commentsByImage[imageUrl] && commentsByImage[imageUrl].length > 0 && (
              <div className="mt-2">
                {commentsByImage[imageUrl].map((comment, idx) => (
                  <div 
                    key={idx} 
                    className="mb-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div className="flex items-center mb-1 text-gray-500">
                      <PenTool size={12} className="mr-1" />
                      <span className="text-xs">Comentario{commentsByImage[imageUrl].length > 1 ? ` ${idx + 1}` : ''}:</span>
                    </div>
                    &ldquo;{comment}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallerySummary;
