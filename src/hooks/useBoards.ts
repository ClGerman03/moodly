import { useQuery } from '@tanstack/react-query';
import { boardService } from '@/services';
import { User } from '@supabase/supabase-js';

/**
 * Interface para representar la estructura de un tablero
 */
export interface BoardItem {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  slug: string;
  isPublished: boolean;
  isActive?: boolean;
  reviewers?: { id: string; avatar?: string; name?: string }[];
  reviewCount?: number;
}

/**
 * useBoards - Hook personalizado para obtener los tableros del usuario
 * 
 * Este hook implementa buenas prácticas como:
 * - Clave de consulta única por usuario
 * - Transformación de datos consistente
 * - Control de tiempo de caché
 * - Deshabilitar consulta cuando no hay usuario
 */
export function useBoards(user: User | null) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    // Clave única para esta consulta basada en el ID del usuario
    // Siempre proporcionamos un array para cumplir con el tipo esperado
    queryKey: ['boards', user?.id || 'guest'],
    
    // Función para obtener los datos
    queryFn: async () => {
      if (!user?.id) return [] as BoardItem[]; // Retornamos array vacío si no hay usuario
      
      // Obtener tableros desde Supabase
      const supabaseBoards = await boardService.getBoardsByUser(user.id);
      
      // Transformar a nuestra estructura de BoardItem
      const userBoards: BoardItem[] = supabaseBoards.map(board => {
        // Datos de revisores (se mantendrá la lógica actual para la demo)
        const demoReviewCount = Math.floor(Math.random() * 5) + 1;
        
        return {
          id: board.id,
          name: board.name,
          updatedAt: board.updated_at,
          createdAt: board.created_at,
          slug: board.slug,
          isPublished: board.is_published,
          isActive: board.is_published,
          reviewCount: demoReviewCount
        };
      });
      
      // Ordenar tableros por fecha de actualización (más reciente primero)
      return userBoards.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    
    // Opciones de configuración
    enabled: !!user?.id, // Solo ejecutar si hay un ID de usuario
    staleTime: 2 * 60 * 1000, // Datos frescos por 2 minutos
    gcTime: 10 * 60 * 1000, // Mantener en caché por 10 minutos
    refetchOnWindowFocus: false, // No refrescar cuando el usuario vuelva a la pestaña
  });

  return {
    boards: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}
