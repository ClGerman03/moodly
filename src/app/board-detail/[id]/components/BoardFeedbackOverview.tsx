"use client";

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import BoardReviewers from '@/app/dashboard/components/BoardReviewers';

interface BoardFeedbackOverviewProps {
  board: {
    id: string;
    reviewCount?: number;
  };
  feedbackData?: {
    reviewers: {
      id: string;
      name: string;
      lastUpdated: string;
      completed: boolean;
      itemCount: number;
    }[];
    feedbackStats: {
      totalReactions: number;
      positiveReactions: number;
      negativeReactions: number;
      neutralReactions: number;
      totalComments: number;
      commentsBySection: Record<string, number>;
    };
    feedbackItems: Record<string, { itemId: string; section_id: string; reaction: 'positive' | 'negative' | 'neutral'; comments: { text: string; timestamp: string }[] }[]>;
  } | null;
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

const BoardFeedbackOverview: React.FC<BoardFeedbackOverviewProps> = ({ board, feedbackData }) => {
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
    
    // Si tenemos datos de feedback de Supabase, usarlos directamente
    if (feedbackData) {
      // Obtener el número real de revisores desde los datos de feedback
      const actualReviewers = feedbackData.reviewers.length;
      setActualReviewerCount(actualReviewers);
      
      // Extraer estadísticas del objeto feedbackData
      setFeedbackStats({
        totalReactions: feedbackData.feedbackStats.totalReactions,
        positiveReactions: feedbackData.feedbackStats.positiveReactions,
        negativeReactions: feedbackData.feedbackStats.negativeReactions,
        neutralReactions: feedbackData.feedbackStats.neutralReactions,
        totalComments: feedbackData.feedbackStats.totalComments,
        recentComments: [], // TODO: cuando tengamos el texto de los comentarios
        loading: false
      });
      return;
    }
    
    // Fallback para retrocompatibilidad - Si no tenemos datos de Supabase, utilizar datos simulados
    setActualReviewerCount(board.reviewCount || 0);
    setFeedbackStats({
      totalReactions: Math.floor(Math.random() * 20) + 5,
      positiveReactions: Math.floor(Math.random() * 15) + 3,
      negativeReactions: Math.floor(Math.random() * 5) + 1,
      neutralReactions: 0,
      totalComments: Math.floor(Math.random() * 10) + 1,
      recentComments: [
        'Me gusta la estructura general',
        'El color principal no refleja bien la marca',
        'La sección de precios es perfecta'
      ],
      loading: false
    });
  }, [board.id, feedbackData, board.reviewCount]); 
  
  return (
    <div className="mt-8 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Resumen de Feedback</h2>
        <div className="text-sm bg-gray-100 rounded-full px-3 py-1 text-gray-700">
          {/* Mostrar el número real de revisores basado en los datos de Supabase */}
          {feedbackData ? feedbackData.reviewers.length : (board.reviewCount || 0)} revisores
        </div>
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
