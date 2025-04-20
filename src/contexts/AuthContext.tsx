'use client'

/**
 * Contexto de Autenticación
 * 
 * Este componente proporciona un contexto global para gestionar la autenticación
 * del usuario en toda la aplicación, utilizando Supabase Auth.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { getCachedProfile, cacheProfile, clearProfileCache } from '@/lib/profileCache'

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
  
  // Referencia para controlar si estamos ya obteniendo el perfil
  const isRefreshingProfile = useRef(false)
  
  // Función para obtener el perfil del usuario
  const fetchProfileFromSupabase = async (userId: string): Promise<ProfileType | null> => {
    try {
      // Comprobar si ya tenemos el perfil en caché
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        console.log('Usando perfil desde caché');
        return cachedProfile;
      }
      
      console.log('Obteniendo perfil desde Supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error al cargar el perfil:', error)
        return null;
      } 
      
      if (data) {
        // Guardar en caché para futuras consultas
        cacheProfile(userId, data);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error inesperado al obtener perfil:', err);
      return null;
    }
  }

  // Función para obtener el perfil del usuario 
  const refreshProfile = useCallback(async () => {
    if (!user || isRefreshingProfile.current) return;
    
    try {
      console.log('Actualizando perfil del usuario manualmente...');
      isRefreshingProfile.current = true;
      const fetchedProfile = await fetchProfileFromSupabase(user.id);
      
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        console.log('Perfil actualizado correctamente');
      }
    } finally {
      isRefreshingProfile.current = false;
    }
  }, [user]);

  // Referencia para timeout (usado en la limpieza)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      
      // Limpiar la caché del perfil
      clearProfileCache();
      
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

  // Efecto para gestionar el cambio de usuario y la sesión
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Obtener el estado de sesión inicial
    const fetchInitialSession = async () => {
      try {
        console.log('Obteniendo sesión inicial...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        // Verificar que el componente aún esté montado antes de actualizar el estado
        if (!isMounted) return;
        
        if (initialSession) {
          console.log('Sesión inicial obtenida, actualizando estado...');
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Usar caché o cargar perfil si es necesario
          if (initialSession.user) {
            const userId = initialSession.user.id;
            const cachedProfile = getCachedProfile(userId);
            
            if (cachedProfile) {
              console.log('Usando perfil en caché para sesión inicial');
              setProfile(cachedProfile);
            } else {
              console.log('Perfil no en caché, obteniendo de Supabase...');
              const fetchedProfile = await fetchProfileFromSupabase(userId);
              if (fetchedProfile && isMounted) {
                setProfile(fetchedProfile);
              }
            }
          }
        } else {
          console.log('No hay sesión inicial');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error al obtener sesión inicial:', err);
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchInitialSession();
    
    // Suscribirse a los cambios de autenticación - solo una vez
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Evento de autenticación: ${event}`);
        
        // Verificar que el componente aún esté montado antes de actualizar el estado
        if (!isMounted) return;
        
        // Actualizar estado solo si hay un cambio real en la sesión o usuario
        const newUser = newSession?.user || null;
        
        // Actualizamos los estados basados en el evento
        if (event === 'SIGNED_IN') {
          console.log('Usuario ha iniciado sesión');
          setSession(newSession);
          setUser(newUser);
          
          if (newUser) {
            // Intento usar caché primero
            const cachedProfile = getCachedProfile(newUser.id);
            if (cachedProfile) {
              console.log('Usando perfil en caché para SIGNED_IN');
              setProfile(cachedProfile);
            } else {
              // Solo hacemos una llamada a la API si no está en caché
              console.log('Obteniendo perfil tras SIGNED_IN');
              const fetchedProfile = await fetchProfileFromSupabase(newUser.id);
              if (fetchedProfile && isMounted) {
                setProfile(fetchedProfile);
              }
            }
          }
        } 
        else if (event === 'SIGNED_OUT') {
          console.log('Usuario ha cerrado sesión');
          setSession(null);
          setUser(null);
          setProfile(null);
          clearProfileCache();
        }
        else if (event === 'USER_UPDATED' && newUser) {
          console.log('Usuario actualizado, refrescando perfil');
          setSession(newSession);
          setUser(newUser);
          
          // Actualizar perfil solo cuando los datos del usuario cambian
          const fetchedProfile = await fetchProfileFromSupabase(newUser.id);
          if (fetchedProfile && isMounted) {
            setProfile(fetchedProfile);
          }
        }
        // No hacemos nada para TOKEN_REFRESHED, ya que no necesitamos actualizar el perfil
      }
    );
    
    // Limpiar suscripción al desmontar y marcar componente como desmontado
    return () => {
      console.log('Limpiando suscripción de autenticación');
      isMounted = false;
      subscription.unsubscribe();
      
      // Limpiar cualquier timeout pendiente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []); // No dependencias para evitar múltiples suscripciones

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
