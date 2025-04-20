'use client'

/**
 * Boards Section
 * 
 * Component that displays the user's boards and
 * provides options to create new boards.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2, ClipboardList, Eye, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import BoardReviewers from './BoardReviewers'

// Tipo para la estructura de un tablero
interface BoardItem {
  id: string
  name: string
  updatedAt: string
  createdAt: string
  isActive?: boolean // Nuevo campo para indicar si el tablero está activo
  reviewers?: {id: string, avatar?: string, name?: string}[] // Nuevo campo para los revisores
  reviewCount?: number // Nuevo campo para la cantidad de revisores
}

export default function BoardsSection() {
  const { user } = useAuth()
  const [boards, setBoards] = useState<BoardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Efecto para cargar los tableros desde localStorage
  useEffect(() => {
    if (!user) return

    // Simulamos un tiempo de carga para mostrar el indicador
    const loadTimer = setTimeout(() => {
      // Función para cargar los tableros del usuario desde localStorage
      const loadBoards = () => {
        try {
          // Obtener todas las claves de localStorage
          const keys = Object.keys(localStorage)
          
          // Filtrar solo las claves de tableros (formato: moodly-board-*)
          const boardKeys = keys.filter(key => key.startsWith('moodly-board-'))
          
          // Extraer los datos de los tableros
          const userBoards: BoardItem[] = []
          
          boardKeys.forEach(key => {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}')
              
              // Solo incluir los tableros del usuario actual
              if (data.userId === user.id) {
                // Simulamos datos de revisores para la demo
                const demoReviewCount = Math.floor(Math.random() * 5) + 1 // Entre 1 y 5 revisores
                
                userBoards.push({
                  id: key.replace('moodly-board-', ''),
                  name: data.name || 'Tablero sin nombre',
                  updatedAt: data.updatedAt || data.createdAt,
                  createdAt: data.createdAt,
                  isActive: true, // Por defecto consideramos todos activos
                  reviewCount: demoReviewCount // Agregamos datos de demo para revisores
                })
              }
            } catch (error) {
              console.error('Error al parsear tablero:', key, error)
            }
          })
          
          // Ordenar tableros por fecha de actualización (más reciente primero)
          userBoards.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          
          setBoards(userBoards)
        } catch (error) {
          console.error('Error al cargar tableros:', error)
        } finally {
          setIsLoading(false)
        }
      }
      
      loadBoards()
    }, 500) // Simular tiempo de carga de 500ms
    
    return () => clearTimeout(loadTimer)
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
                <div className="relative w-2.5 h-2.5">
                  <div className="absolute inset-0 bg-green-300 rounded-full opacity-30"></div>
                  <div className="absolute inset-0.5 bg-green-400 rounded-full opacity-60"></div>
                  <div className="absolute inset-1 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Título del tablero (alineado a la izquierda) */}
              <div className="mt-2">
                <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 text-sm">
                  {board.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Componente de revisores */}
              <BoardReviewers reviewCount={board.reviewCount} />

              {/* Botones de acción (siempre visibles) */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <Link
                    href={`/board-detail/${board.id}`}
                    className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>Open</span>
                  </Link>
                  
                  <Link
                    href={`/board/${board.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    <span>View</span>
                  </Link>
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
