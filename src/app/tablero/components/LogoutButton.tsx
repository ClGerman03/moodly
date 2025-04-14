'use client'

/**
 * Botón de Cierre de Sesión
 * 
 * Componente dedicado exclusivamente para manejar el cierre de sesión
 * de manera aislada y efectiva, evitando conflictos con otros componentes.
 */

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { LucideLogOut, LucideLoader } from 'lucide-react'

export default function LogoutButton() {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para manejar el cierre de sesión de forma directa
  const handleLogout = async () => {
    if (isLoading) return // Evitar clics múltiples
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Si hay un error previo, mostrar un tooltip
      if (error) {
        setError(null)
      }
      
      // Llamar directamente a la función de cierre de sesión desde el contexto
      await signOut()
      
      // No necesitamos manejar la redirección aquí,
      // ya que se maneja en el contexto de autenticación
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      setError('Error al cerrar sesión. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  // Mostrar un tooltip con el error si existe
  const ErrorTooltip = () => {
    if (!error) return null
    
    return (
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 text-xs py-1 px-2 rounded shadow-md">
        {error}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-red-100"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <ErrorTooltip />
      <motion.button
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <LucideLoader className="w-4 h-4 animate-spin" />
            <span>Cerrando...</span>
          </>
        ) : (
          <>
            <LucideLogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
