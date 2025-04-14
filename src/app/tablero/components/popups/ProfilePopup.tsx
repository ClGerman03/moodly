'use client'

/**
 * Popup de Perfil de Usuario
 * 
 * Componente minimalista que muestra la información del usuario
 * y opciones relacionadas con la cuenta.
 */

import { motion } from 'framer-motion'
import { LucideLogOut, LucideUser, LucideLoader } from 'lucide-react'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'

interface ProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSignOut: () => void
  isSigningOut?: boolean
  signOutError?: string | null
}

export default function ProfilePopup({ 
  isOpen, 
  onClose, 
  user, 
  onSignOut,
  isSigningOut = false,
  signOutError = null
}: ProfilePopupProps) {
  if (!isOpen) return null

  // Extraer el nombre del usuario del email
  const userName = user?.email?.split('@')[0] || 'Usuario'
  
  // Verificar si el usuario tiene avatar
  const avatarUrl = user?.user_metadata?.avatar_url
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] p-2.5 w-52 mr-2 mt-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2.5 mb-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
          {/* Avatar o icono de usuario */}
          {avatarUrl ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
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
          
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-light text-gray-700 dark:text-gray-300 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        {signOutError && (
          <p className="text-xs text-red-500 mb-2 px-1">
            {signOutError}
          </p>
        )}
        
        {user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSignOut();
            }}
            disabled={isSigningOut}
            className={`w-full flex items-center space-x-2 text-xs font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-md transition-colors ${
              isSigningOut ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSigningOut ? (
              <>
                <LucideLoader className="w-3.5 h-3.5 animate-spin" />
                <span>Cerrando sesión...</span>
              </>
            ) : (
              <>
                <LucideLogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  )
}
