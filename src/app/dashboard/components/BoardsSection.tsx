'use client'

/**
 * Boards Section
 * 
 * Component that displays the user's boards and
 * provides options to create new boards.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2, ClipboardList, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import BoardReviewers from './BoardReviewers'
import { boardService } from '@/services'

// Tipo para la estructura de un tablero
interface BoardItem {
  id: string
  name: string
  updatedAt: string
  createdAt: string
  slug: string
  isPublished: boolean
  isActive?: boolean // Campo para indicar si el tablero está activo
  reviewers?: {id: string, avatar?: string, name?: string}[] // Campo para los revisores
  reviewCount?: number // Campo para la cantidad de revisores
}

export default function BoardsSection() {
  const { user } = useAuth()
  const [boards, setBoards] = useState<BoardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar los tableros del usuario desde Supabase
  const loadBoards = async () => {
    try {
      if (!user || !user.id) {
        console.log('No hay usuario disponible para cargar tableros');
        return;
      }
      
      console.log('Cargando tableros desde Supabase...');
      
      // Obtener los tableros del usuario desde Supabase
      const supabaseBoards = await boardService.getBoardsByUser(user.id);
      console.log(`Se encontraron ${supabaseBoards.length} tableros en Supabase`);
      
      // Transformar a nuestra estructura de BoardItem
      const userBoards: BoardItem[] = supabaseBoards.map(board => {
        // Simulamos datos de revisores para la demo
        const demoReviewCount = Math.floor(Math.random() * 5) + 1; // Entre 1 y 5 revisores
        
        return {
          id: board.id,
          name: board.name,
          updatedAt: board.updated_at,
          createdAt: board.created_at,
          slug: board.slug,
          isPublished: board.is_published,
          isActive: board.is_published, // Consideramos activos los publicados
          reviewCount: demoReviewCount // Datos de demo para revisores
        };
      });
      
      console.log(`Se procesaron ${userBoards.length} tableros para el usuario ${user.id}`);
      
      // Ordenar tableros por fecha de actualización (más reciente primero)
      userBoards.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setBoards(userBoards);
    } catch (error) {
      console.error('Error al cargar tableros:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efecto para cargar los tableros cuando el usuario está disponible
  useEffect(() => {
    if (!user) {
      // Si no hay usuario, mostrar el estado de carga y no hacer nada más
      console.log('No hay usuario disponible para cargar tableros');
      return;
    }

    console.log('Usuario disponible, cargando tableros...');
    setIsLoading(true);
    
    // Cargar tableros con un pequeño retraso para dar tiempo a que se complete la autenticación
    const loadTimer = setTimeout(() => {
      loadBoards();
    }, 300);
    
    return () => clearTimeout(loadTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-700">My Boards</h2>
        <Link 
          href="/tablero" 
          className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Board</span>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : boards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {boards.map(board => (
            <div
              key={board.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 relative h-[180px]"
            >
              {/* Indicador de estado activo */}
              <div className="absolute top-3 right-3">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-green-300 rounded-full opacity-30"></div>
                  <div className="absolute inset-0.5 bg-green-400 rounded-full opacity-60"></div>
                  <div className="absolute inset-1 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Título del tablero (alineado a la izquierda) */}
              <div className="mt-1.5">
                <h3 className="text-base font-medium">{board.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(board.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${board.isPublished ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-600'}`}>
                    {board.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {board.isPublished && (
                    <span className="text-[10px] text-gray-400 ml-1.5">{board.slug}</span>
                  )}
                </div>
              </div>

              {/* Componente de revisores */}
              <BoardReviewers reviewCount={board.reviewCount} />

              {/* Botones de acción (siempre visibles) */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <Link
                    href={`/board-detail/${board.id}`}
                    className="text-[10px] text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ClipboardList size={12} />
                    <span>Analytics</span>
                  </Link>
                  
                  {board.isPublished ? (
                    <Link
                      href={`/board/${board.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>View Public</span>
                    </Link>
                  ) : (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Eye size={12} />
                      <span>Not Published</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <ClipboardList className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">You don&apos;t have any saved boards</p>
          <p className="text-gray-500 text-sm mb-4">
            Create your first board to start organizing your visual ideas
          </p>
          <Link 
            href="/tablero" 
            className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm inline-flex items-center gap-2 hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            <span>Create Board</span>
          </Link>
        </div>
      )}
    </div>
  )
}
