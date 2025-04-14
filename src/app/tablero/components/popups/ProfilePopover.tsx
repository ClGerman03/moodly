'use client'

/**
 * Popover de Perfil
 * 
 * Componente que muestra información del usuario y opciones
 * de cuenta, incluyendo el botón de cierre de sesión.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { LucideUser, LucideLogOut, LucideLoader } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface ProfilePopoverProps {
  user: User | null
}

export default function ProfilePopover({ user }: ProfilePopoverProps) {
  const { signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  
  // Extraer información del usuario
  const userName = user?.email?.split('@')[0] || 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url
  
  // Manejar clic fuera del popover para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      setError(null)
      await signOut()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      setError('Error al cerrar sesión. Intenta de nuevo.')
      setIsLoading(false)
    }
  }
  
  // Función para alternar la visibilidad del popover
  const togglePopover = () => {
    setIsOpen(prev => !prev)
  }
  
  return (
    <div className="relative" ref={popoverRef}>
      {/* Botón de perfil */}
      <button 
        onClick={togglePopover}
        className={`p-1 rounded-full focus:outline-none transition-colors duration-300 relative ${
          isOpen ? 'ring-2 ring-blue-400 dark:ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Perfil de usuario"
      >
        {avatarUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={userName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <LucideUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </button>
      
      {/* Popover con información del usuario y opciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Encabezado con información del usuario */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                {avatarUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={userName}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <LucideUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Opciones del usuario */}
            <div className="mt-1">
              {error && (
                <p className="px-4 py-1 text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <LucideLoader className="w-4 h-4 animate-spin" />
                    <span>Cerrando sesión...</span>
                  </>
                ) : (
                  <>
                    <LucideLogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
