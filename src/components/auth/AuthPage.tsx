'use client'

/**
 * Componente cliente de la página de autenticación
 * 
 * Implementa las animaciones y la lógica de cliente para la página de autenticación.
 */

import AuthForm from '@/components/auth/AuthForm'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  // Estado para controlar la animación de entrada
  const [isVisible, setIsVisible] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Efecto para redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (!isLoading && user) {
      console.log('Usuario ya autenticado, redirigiendo a /dashboard')
      router.replace('/dashboard')
      return
    }
    
    // Activar la animación después de que el componente se monte
    setIsVisible(true)
  }, [user, isLoading, router])
  
  // Si estamos cargando o redirigiendo, mostrar un estado de carga
  if (isLoading || (user && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-2">Verificando sesión...</p>
          <div className="w-10 h-10 border-t-2 border-gray-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.main 
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
    >
      <motion.div 
        className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: isVisible ? 0 : 20, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <AuthForm />
      </motion.div>
    </motion.main>
  )
}
