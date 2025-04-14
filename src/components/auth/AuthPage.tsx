'use client'

/**
 * Componente cliente de la página de autenticación
 * 
 * Implementa las animaciones y la lógica de cliente para la página de autenticación.
 */

import AuthForm from '@/components/auth/AuthForm'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AuthPage() {
  // Estado para controlar la animación de entrada
  const [isVisible, setIsVisible] = useState(false)
  
  // Activar la animación después de que el componente se monte
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
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
