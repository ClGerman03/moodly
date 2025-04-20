"use client";

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import BoardReviewers from '@/app/dashboard/components/BoardReviewers';
import { loadBoardFeedback } from '@/lib/feedbackService';

interface BoardFeedbackOverviewProps {
  board: {
    id: string;
    reviewCount?: number;
  };
}

// Interfaz para las estadísticas de feedback
interface FeedbackStats {
  totalReactions: number;
  positiveReactions: number;
  negativeReactions: number;
  neutralReactions: number; // Mantenemos por compatibilidad pero no lo usaremos
  totalComments: number;
  recentComments: string[];
  loading: boolean;
}

const BoardFeedbackOverview: React.FC<BoardFeedbackOverviewProps> = ({ board }) => {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalReactions: 0,
    positiveReactions: 0,
    negativeReactions: 0,
    neutralReactions: 0,
    totalComments: 0,
    recentComments: [],
    loading: true
  });
  
  // Estado para almacenar el número real de revisores
  const [actualReviewerCount, setActualReviewerCount] = useState<number>(0);

  // Cargar y procesar los datos de feedback reales
  useEffect(() => {
    if (!board.id) return;
    
    // Cargar los datos de feedback del tablero
    const boardFeedback = loadBoardFeedback(board.id);
    
    // Obtener el número real de revisores desde el servicio
    const actualReviewers = boardFeedback.reviewers.length;
    setActualReviewerCount(actualReviewers);
    
    // Calcular estadísticas agregadas
    let positiveReactions = 0;
    let negativeReactions = 0;
    let totalComments = 0;
    const allComments: { text: string; timestamp: string }[] = [];
    
    // Procesar datos de cada revisor
    boardFeedback.reviewers.forEach(reviewer => {
      // Conteo de comentarios totales a nivel de revisor, usando la misma lógica que en BoardReviewerFeedback
      Object.values(reviewer.responses).forEach(section => {
        totalComments += (section.comments?.length || 0);
        
        // Recolectar los comentarios para mostrar
        if (section.comments) {
          section.comments.forEach(comment => {
            allComments.push({ text: comment.comment, timestamp: comment.timestamp });
          });
        }
      });
      
      // Contar reacciones usando EXACTAMENTE la misma lógica que en BoardReviewerFeedback
      Object.values(reviewer.responses).forEach(section => {
        // IMPORTANTE: La lógica en BoardReviewerFeedback usa el operador OR (||) entre
        // paletteFeedbacks y feedbackItems, no suma ambos valores
        
        // Para reacciones positivas:
        if (section.paletteFeedbacks && section.paletteFeedbacks.length > 0) {
          // Si hay paletteFeedbacks, usar ese conteo
          positiveReactions += section.paletteFeedbacks.filter(f => f.type === 'positive').length;
        } else if (section.feedbackItems) {
          // Si no hay paletteFeedbacks, usar el conteo de feedbackItems
          positiveReactions += Object.values(section.feedbackItems).filter(item => 
            item.reaction === 'positive'
          ).length;
        }
        
        // Para reacciones negativas:
        if (section.paletteFeedbacks && section.paletteFeedbacks.length > 0) {
          // Si hay paletteFeedbacks, usar ese conteo
          negativeReactions += section.paletteFeedbacks.filter(f => f.type === 'negative').length;
        } else if (section.feedbackItems) {
          // Si no hay paletteFeedbacks, usar el conteo de feedbackItems
          negativeReactions += Object.values(section.feedbackItems).filter(item => 
            item.reaction === 'negative'
          ).length;
        }
        
        // Añadir reacciones de imágenes si existen (esto sigue diferente lógica)
        if (section.imageFeedback) {
          const imageFeedbacks = Object.values(section.imageFeedback);
          const positiveImages = imageFeedbacks.filter(reaction => reaction === 'positive').length;
          const negativeImages = imageFeedbacks.filter(reaction => reaction === 'negative').length;
          
          // Solo contar imágenes si no hay otros tipos de feedback en la sección
          if (!(section.paletteFeedbacks && section.paletteFeedbacks.length > 0) && 
              !Object.keys(section.feedbackItems || {}).length) {
            positiveReactions += positiveImages;
            negativeReactions += negativeImages;
          }
        }
      });
    });
    
    // Ordenar comentarios por fecha, más recientes primero
    allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Obtener los 2 comentarios más recientes
    const recentComments = allComments.slice(0, 2).map(comment => comment.text);
    
    // Calcular total de reacciones (solo positivas y negativas)
    const totalReactions = positiveReactions + negativeReactions;
    
    // Actualizar el estado con las estadísticas calculadas
    setFeedbackStats({
      totalReactions,
      positiveReactions,
      negativeReactions,
      neutralReactions: 0, // Ya no contamos las neutrales
      totalComments,
      recentComments,
      loading: false
    });
    
  }, [board.id]); // Actualizar si cambia el ID del tablero
  
  return (
    <div className="mt-8 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-700">Feedback Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumen de revisores */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl font-light text-gray-700">{actualReviewerCount}</span>
            </div>
            <h3 className="ml-3 text-sm font-medium text-gray-800">Reviewers</h3>
          </div>
          
          <div className="flex items-center pl-10">
            <BoardReviewers reviewCount={actualReviewerCount} />
          </div>
        </div>
        
        {/* Resumen de reacciones */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl font-light text-gray-700">{feedbackStats.totalReactions}</span>
            </div>
            <h3 className="ml-3 text-sm font-medium text-gray-800">Reactions</h3>
          </div>
          
          <div className="flex items-center pl-11">
            <div className="flex-1">
              <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden flex">
                {feedbackStats.totalReactions > 0 ? (
                  <>
                    <div 
                      className="h-full bg-gray-600" 
                      style={{ width: `${(feedbackStats.positiveReactions / feedbackStats.totalReactions) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-gray-300" 
                      style={{ width: `${(feedbackStats.negativeReactions / feedbackStats.totalReactions) * 100}%` }}
                    ></div>
                  </>
                ) : null}
              </div>
              <div className="flex text-xs text-gray-500 mt-2 justify-between">
                <div className="flex items-center">
                  <ThumbsUp className="w-3 h-3 text-gray-600 mr-1" />
                  <span>{feedbackStats.positiveReactions}</span>
                </div>
                <div className="flex items-center">
                  <ThumbsDown className="w-3 h-3 text-gray-500 mr-1" />
                  <span>{feedbackStats.negativeReactions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Resumen de comentarios */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl font-light text-gray-700">{feedbackStats.totalComments}</span>
            </div>
            <h3 className="ml-3 text-sm font-medium text-gray-800">Comments</h3>
          </div>
          
          <div className="flex items-center pl-11">
            <div className="space-y-1 flex-1">
              {feedbackStats.loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : feedbackStats.recentComments.length > 0 ? (
                feedbackStats.recentComments.map((comment, index) => (
                  <p key={index} className="text-xs text-gray-500 line-clamp-1">&quot;{comment}&quot;</p>
                ))
              ) : (
                <p className="text-gray-500">This board doesn&apos;t have any feedback yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardFeedbackOverview;
