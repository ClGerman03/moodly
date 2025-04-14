'use client'

/**
 * Formulario de autenticación
 * 
 * Componente que maneja la UI para la autenticación,
 * manteniendo el estilo minimalista de Moodly.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import GoogleSignInButton from './GoogleSignInButton'

export default function AuthForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Logo de Moodly */}
      <div className="flex flex-col items-center">
        <Link href="/" className="mb-6">
          <Image
            src="/images/Moodly.png"
            alt="Moodly-Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </Link>
        
        <h1 className="text-2xl font-light text-gray-800 mb-2">
          Bienvenido a Moodly
        </h1>
        <p className="text-gray-500 font-light text-center">
          Inicia sesión para guardar y compartir tus tableros
        </p>
      </div>
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Botón de inicio de sesión con Google */}
      <div className="space-y-4">
        <GoogleSignInButton />
        
        <div className="text-center">
          <span className="text-gray-500 text-xs">o</span>
        </div>
        
        <Link 
          href="/tablero" 
          className="w-full flex justify-center px-6 py-2.5 text-white bg-gray-800 hover:bg-gray-700 rounded-full font-light tracking-wide transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 opacity-90 hover:opacity-100"
        >
          Continuar sin registrarte
        </Link>
      </div>
      
      {/* Información adicional */}
      <div className="text-center text-xs text-gray-400 mt-10">
        <p>
          Al iniciar sesión, aceptas nuestros{' '}
          <Link href="/terminos" className="text-gray-500 underline hover:text-gray-700">
            Términos de servicio
          </Link>
          {' '}y{' '}
          <Link href="/privacidad" className="text-gray-500 underline hover:text-gray-700">
            Política de privacidad
          </Link>
        </p>
      </div>
    </div>
  )
}
