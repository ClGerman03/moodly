'use client'

/**
 * Proveedores globales de la aplicación
 * 
 * Este componente envuelve toda la aplicación y proporciona
 * los contextos necesarios, como autenticación.
 */

import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
