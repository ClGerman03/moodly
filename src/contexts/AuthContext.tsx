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
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account' // Forzar la pantalla de selección de cuentas de Google
          }
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
      // Limpiar el estado local inmediatamente para feedback instantáneo
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Redireccionar a la página principal
      window.location.href = '/?logout=true';
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoading(false); // Restablecer el estado de carga en caso de error
      throw error; // Re-lanzar el error para manejo externo
    }
  }

  // Efecto para escuchar cambios en la autenticación
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Obtener el estado de sesión inicial
    const fetchInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      // Verificar que el componente aún esté montado antes de actualizar el estado
      if (!isMounted) return;
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        
        // Solo obtener el perfil si tenemos un usuario y no lo hemos cargado aún
        if (initialSession.user && !profile) {
          await refreshProfile();
        }
      }
      
      setIsLoading(false);
    };
    
    fetchInitialSession();
    
    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Verificar que el componente aún esté montado antes de actualizar el estado
        if (!isMounted) return;
        
        // Actualizar estado solo si hay un cambio real en la sesión o usuario
        const newUser = newSession?.user || null;
        const shouldUpdateUser = (
          (user === null && newUser !== null) ||
          (user !== null && newUser === null) ||
          (user?.id !== newUser?.id)
        );
        
        if (shouldUpdateUser) {
          setSession(newSession);
          setUser(newUser);
          
          // Solo obtener el perfil si tenemos un usuario nuevo
          if (newUser && event !== 'TOKEN_REFRESHED') {
            await refreshProfile();
          }
          
          // Solo refrescar la página en eventos específicos que lo requieran
          // como SIGNED_IN o SIGNED_OUT, pero NO en cada cambio de estado
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            // No llamar a router.refresh() aquí para evitar bucles infinitos
            // En su lugar, solo hacemos navegación puntual cuando realmente hace falta
          }
        }
      }
    );
    
    // Limpiar suscripción al desmontar y marcar componente como desmontado
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user, profile, refreshProfile])

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
