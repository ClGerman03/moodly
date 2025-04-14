/**
 * Página de autenticación (Componente servidor)
 * 
 * Esta página maneja la autenticación de usuarios y define los metadatos.
 * La implementación real de la UI está en el componente cliente AuthPage.
 */

import { Metadata } from 'next'
import AuthPageClient from '@/components/auth/AuthPage'

export const metadata: Metadata = {
  title: 'Iniciar sesión en Moodly',
  description: 'Inicia sesión en Moodly para guardar y compartir tus tableros',
}

export default function Auth() {
  return <AuthPageClient />
}
