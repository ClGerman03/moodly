import { useQuery } from '@tanstack/react-query';
import { boardService } from '@/services/boardService';
import { feedbackService } from '@/services/feedbackService';
import { sectionService } from '@/services/sectionService';
import { Section } from '@/app/tablero/types';
import { FeedbackReactionType } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Interface para representar el detalle de un tablero
 */
export interface BoardDetail {
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

/**
 * Interface para representar los datos de feedback
 */
export interface FeedbackData {
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
}

/**
 * useBoardDetail - Hook personalizado para obtener los detalles de un tablero y su feedback
 * 
 * Este hook implementa buenas pru00e1cticas como:
 * - Clave de consulta u00fanica por tablero
 * - Transformaciu00f3n de datos consistente
 * - Validaciu00f3n de permisos de usuario
 * - Control de estados de carga y error
 */
export function useBoardDetail(boardId: string | undefined, user: User | null) {
  // Consulta para obtener los detalles del tablero y sus secciones
  const { 
    data: boardDetail,
    isLoading: isLoadingBoard,
    isError: isBoardError,
    error: boardError
  } = useQuery({
    queryKey: ['boardDetail', boardId],
    queryFn: async () => {
      if (!boardId) return null;
      if (!user?.id) return null;

      // Obtener datos del tablero
      const boardData = await boardService.getBoardById(boardId);
      if (!boardData) throw new Error('Board not found');

      // Verificar si el tablero pertenece al usuario
      if (boardData.user_id !== user.id) {
        throw new Error('You don\'t have permission to view this board');
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

      return {
        id: boardData.id,
        name: boardData.name,
        userId: boardData.user_id,
        createdAt: boardData.created_at,
        updatedAt: boardData.updated_at,
        sections: sections || [],
        slug: boardData.slug,
        isPublished: boardData.is_published
      } as BoardDetail;
    },
    enabled: !!boardId && !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutos de datos frescos
    gcTime: 10 * 60 * 1000, // 10 minutos en cachu00e9
  });

  // Consulta para obtener los datos de feedback
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isError: isFeedbackError,
    error: feedbackError
  } = useQuery({
    queryKey: ['boardFeedback', boardId],
    queryFn: async () => {
      if (!boardId) return null;
      if (!user?.id) return null;

      // Obtener datos de feedback
      const feedback = await feedbackService.getBoardFeedbackAnalytics(boardId);

      // Adaptar los datos al formato esperado
      return {
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
      } as FeedbackData;
    },
    enabled: !!boardId && !!user?.id && !!boardDetail,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Calculamos valores derivados
  const isLoading = isLoadingBoard || isLoadingFeedback;
  const isError = isBoardError || isFeedbackError;
  const error = boardError || feedbackError;
  
  // Si tenemos el detalle del tablero y el feedback, actualizamos el recuento de revisores
  const board = boardDetail ? {
    ...boardDetail,
    reviewCount: feedbackData?.reviewers.length || 0
  } : null;

  return {
    board,
    feedbackData,
    isLoading,
    isError,
    error
  };
}
