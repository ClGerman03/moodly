"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, PenTool } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface Link {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface LinksSummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Componente especializado para mostrar el resumen de feedback de enlaces
 */
const LinksSummary: React.FC<LinksSummaryProps> = ({
  section,
  normalizedFeedback
}) => {
  // Obtener todos los enlaces con feedback
  const linksWithFeedback = normalizedFeedback.reactions.map(r => r.id);
  
  // Agrupar comentarios por enlace
  const commentsByLink: Record<string, string[]> = {};
  normalizedFeedback.comments.forEach(comment => {
    if (!commentsByLink[comment.id]) {
      commentsByLink[comment.id] = [];
    }
    commentsByLink[comment.id].push(comment.comment);
  });
  
  // Obtener todos los enlaces únicos que tienen feedback o comentarios
  const allFeedbackLinks = Array.from(
    new Set([
      ...linksWithFeedback,
      ...Object.keys(commentsByLink)
    ])
  );
  
  // Obtener los enlaces del section data
  const links = (section.data?.links || []) as Link[];
  
  // Helper para obtener enlace por ID
  const getLink = (linkId: string): Link | undefined => {
    return links.find(l => l.id === linkId);
  };
  
  // Obtener tipo de reacción para un enlace
  const getReactionType = (linkId: string) => {
    const reaction = normalizedFeedback.reactions.find(r => r.id === linkId);
    return reaction?.type;
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackLinks.map((linkId) => {
        const link = getLink(linkId);
        if (!link) return null;
        
        return (
          <div key={linkId} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
            <div className="flex items-start mb-2">
              <div className="flex-grow">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {link.title}
                </h4>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block"
                >
                  {link.url}
                </a>
              </div>
              
              <div className="ml-2">
                {getReactionType(linkId) === 'positive' && (
                  <div className="flex items-center text-green-500">
                    <ThumbsUp size={14} className="mr-1" />
                    <span className="text-xs">Positivo</span>
                  </div>
                )}
                {getReactionType(linkId) === 'negative' && (
                  <div className="flex items-center text-red-500">
                    <ThumbsDown size={14} className="mr-1" />
                    <span className="text-xs">Negativo</span>
                  </div>
                )}
                {(!getReactionType(linkId) || getReactionType(linkId) === 'comment') && commentsByLink[linkId] && (
                  <div className="flex items-center text-amber-500">
                    <PenTool size={14} className="mr-1" />
                    <span className="text-xs">Comentado</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Comentarios sobre este enlace */}
            {commentsByLink[linkId] && commentsByLink[linkId].length > 0 && (
              <div className="mt-2">
                {commentsByLink[linkId].map((comment, idx) => (
                  <div 
                    key={idx} 
                    className="mb-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div className="flex items-center mb-1 text-gray-500">
                      <PenTool size={12} className="mr-1" />
                      <span className="text-xs">Comentario{commentsByLink[linkId].length > 1 ? ` ${idx + 1}` : ''}:</span>
                    </div>
                    "{comment}"
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

export default LinksSummary;
