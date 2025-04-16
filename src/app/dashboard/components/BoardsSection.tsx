'use client'

/**
 * Boards Section
 * 
 * Component that displays the user's boards and
 * provides options to create new boards.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Tipo para la estructura de un tablero
interface BoardItem {
  id: string
  name: string
  updatedAt: string
  createdAt: string
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
                userBoards.push({
                  id: key.replace('moodly-board-', ''),
                  name: data.name || 'Tablero sin nombre',
                  updatedAt: data.updatedAt || data.createdAt,
                  createdAt: data.createdAt
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
      <div className="flex justify-between items-center mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(board => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-white group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                  {board.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Updated: {new Date(board.updatedAt).toLocaleDateString()}
              </p>
            </Link>
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
