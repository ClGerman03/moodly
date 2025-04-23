"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { FeedbackReactionType } from "@/types/supabase";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import BoardDetailHeader from "./components/BoardDetailHeader";
import BoardDetailSections from "./components/BoardDetailSections";
import BoardFeedbackOverview from "./components/BoardFeedbackOverview";
import BoardReviewerFeedback from "./components/BoardReviewerFeedback";
import { Section } from "@/app/tablero/types";
import { boardService } from "@/services/boardService";
import { feedbackService } from "@/services/feedbackService";
import { sectionService } from "@/services/sectionService";

interface BoardDetail {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  slug?: string;
  isPublished?: boolean;
  reviewCount?: number;
}

export default function BoardDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const boardId = params?.id as string;
  
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{
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
  } | null>(null);

  // Efecto para cargar los datos del tablero cuando el componente se monte
  useEffect(() => {
    // Si no hay usuario o no hay ID de tablero, mostrar error
    if (!user || !boardId) {
      setError("User not authenticated or board ID not provided");
      setIsLoading(false);
      return;
    }

    // Función para cargar los datos del tablero y su feedback
    const loadBoardDetail = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del tablero desde Supabase
        const boardData = await boardService.getBoardById(boardId);
        
        if (!boardData) {
          setError("Board not found");
          setIsLoading(false);
          return;
        }
        
        // Verificar si el tablero pertenece al usuario actual
        if (boardData.user_id !== user.id) {
          setError("You don't have permission to view this board");
          setIsLoading(false);
          return;
        }
        
        // Cargar secciones del tablero
        const sectionsData = await sectionService.getSectionsByBoardId(boardId);
        
        // Convertir al formato esperado por los componentes
        const sections = sectionsData.map(section => ({
          id: section.section_id,
          type: section.type as Section['type'],
          title: section.title || '',
          description: section.description || '',
          data: section.data as Section['data'],
          order: section.order
        })) as Section[];
        
        // Obtener datos de feedback desde Supabase
        const feedback = await feedbackService.getBoardFeedbackAnalytics(boardId);
        
        // Actualizar estado con los datos cargados
        setBoard({
          id: boardData.id,
          name: boardData.name,
          userId: boardData.user_id,
          createdAt: boardData.created_at,
          updatedAt: boardData.updated_at,
          sections: sections || [],
          slug: boardData.slug,
          isPublished: boardData.is_published,
          reviewCount: feedback.reviewers.length
        });
        
        // Adaptación de los datos que vienen desde Supabase a nuestra estructura interna
        
        // Tipo para el estado local (ya definido en useState)
        type FeedbackData = {
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
          feedbackItems: Record<string, {
            itemId: string;
            section_id: string;
            reaction: FeedbackReactionType;
            comments: { text: string; timestamp: string }[];
          }[]>;
        };
        
        // Adaptar los datos de Supabase al formato esperado por el componente
        const adaptedFeedback: FeedbackData = {
          reviewers: feedback.reviewers,
          feedbackStats: feedback.feedbackStats,
          feedbackItems: Object.fromEntries(
            Object.entries(feedback.feedbackItems).map(([key, items]) => [
              key,
              items.map(item => ({
                itemId: item.item_id,
                section_id: item.section_id,
                reaction: (item.reaction as FeedbackReactionType) || 'neutral',
                comments: item.comment ? [{ 
                  text: item.comment, 
                  timestamp: item.comment_timestamp || item.created_at || new Date().toISOString() 
                }] : []
              }))
            ])
          )
        };
        
        setFeedbackData(adaptedFeedback);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading board:", err);
        setError("Error loading board details");
        setIsLoading(false);
      }
    };
    
    loadBoardDetail();
  }, [user, boardId]);

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading board details...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Navegación de regreso al dashboard */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        
        {board && (
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl space-y-12">
            {/* Cabecera con datos generales del tablero */}
            <BoardDetailHeader board={board} />
            
            {/* Resumen general del feedback recibido */}
            <BoardFeedbackOverview board={board} feedbackData={feedbackData} />
            
            {/* Análisis de feedback por sección */}
            <BoardDetailSections board={board} feedbackData={feedbackData} />
            
            {/* Listado de feedback por revisor */}
            <BoardReviewerFeedback board={board} feedbackData={feedbackData} />
          </div>
        )}
      </div>
    </div>
  );
}
