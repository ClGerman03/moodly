'use client'

/**
 * Contexto de Autenticación
 * 
 * Este componente proporciona un contexto global para gestionar la autenticación
 * del usuario en toda la aplicación, utilizando Supabase Auth.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'

// Tipo para el perfil de usuario
type ProfileType = Database['public']['Tables']['profiles']['Row']

// Definición del tipo de contexto de autenticación
interface AuthContextType {
  user: User | null
  profile: ProfileType | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // Función para obtener el perfil del usuario
  const refreshProfile = useCallback(async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error al cargar el perfil:', error)
    } else if (data) {
      setProfile(data)
    }
  }, [user])

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error)
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    try {
      // Utilizar scope 'global' para cerrar todas las sesiones en todos los dispositivos
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      }
      
      // Solo limpiar el estado local y redirigir después de un cierre de sesión exitoso
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Pequeño retraso para asegurar que los eventos de auth se propaguen correctamente
      setTimeout(() => {
        router.push('/');
        router.refresh(); // Forzar actualización completa de la página
      }, 100);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Notificar al usuario sobre el error (podríamos añadir un toast o alerta aquí)
    }
  }

  // Efecto para escuchar cambios en la autenticación
  useEffect(() => {
    setIsLoading(true)
    
    // Obtener el estado de sesión inicial
    const fetchInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession) {
        setSession(initialSession)
        setUser(initialSession.user)
        await refreshProfile()
      }
      
      setIsLoading(false)
    }
    
    fetchInitialSession()
    
    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user || null)
        
        if (newSession?.user) {
          await refreshProfile()
        }
        
        // Refrescar la página para obtener los datos más recientes
        router.refresh()
      }
    )
    
    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [router, refreshProfile])

  // Valor del contexto
  const value = {
    user,
    profile,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
