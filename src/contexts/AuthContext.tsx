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

// Ambiente de desarrollo
const isDev = process.env.NODE_ENV === 'development';

// Función segura para logging que solo muestra en desarrollo
const safeLog = (message: string, ...optionalParams: unknown[]) => {
  if (isDev) {
    console.log(message, ...optionalParams);
  }
};

// Función segura para errores que siempre se muestran
const safeError = (message: string, ...optionalParams: unknown[]) => {
  console.error(message, ...optionalParams);
};

// Tipo para el perfil de usuario
type ProfileType = Database['public']['Tables']['profiles']['Row']

// Definición del tipo de contexto de autenticación
interface AuthContextType {
  user: User | null
  profile: ProfileType | null
  session: Session | null
  isLoading: boolean
  authError: string | null
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
  const [authError, setAuthError] = useState<string | null>(null)
  // Contador de reintentos para la carga inicial de sesión
  const retryAttemptsRef = useRef<number>(0)
  const maxRetryAttempts = 3
  
  // Referencia para controlar si estamos ya obteniendo el perfil
  const isRefreshingProfile = useRef(false)
  
  // Función para obtener el perfil del usuario
  const fetchProfileFromSupabase = async (userId: string): Promise<ProfileType | null> => {
    try {
      // Comprobar si ya tenemos el perfil en caché
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        safeLog('Usando perfil desde caché');
        return cachedProfile;
      }
      
      safeLog('Obteniendo perfil desde Supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        safeError('Error al cargar el perfil:', error)
        return null;
      } 
      
      if (data) {
        // Guardar en caché para futuras consultas
        cacheProfile(userId, data);
        return data;
      }
      
      return null;
    } catch (err) {
      safeError('Error inesperado al obtener perfil:', err);
      return null;
    }
  }

  // Función para obtener el perfil del usuario 
  const refreshProfile = useCallback(async () => {
    if (!user || isRefreshingProfile.current) return;
    
    try {
      safeLog('Actualizando perfil del usuario manualmente...');
      isRefreshingProfile.current = true;
      const fetchedProfile = await fetchProfileFromSupabase(user.id);
      
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        safeLog('Perfil actualizado correctamente');
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
      safeError('Error al iniciar sesión con Google:', error)
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
      safeError('Error al cerrar sesión:', error);
      setIsLoading(false); // Restablecer el estado de carga en caso de error
      throw error; // Re-lanzar el error para manejo externo
    }
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    async function fetchInitialSession() {
      // Definir fetchInitialSession dentro del useEffect para evitar tenerlo como dependencia
      safeLog('Intentando obtener sesión inicial');
      
      // Función para reintentar la carga de sesión si falla
      async function retryFetchSession() {
        if (retryAttemptsRef.current < maxRetryAttempts && isMounted) {
          const delay = Math.pow(2, retryAttemptsRef.current) * 1000; // Backoff exponencial
          safeLog(`Reintentando obtener sesión en ${delay}ms (intento ${retryAttemptsRef.current + 1}/${maxRetryAttempts})`);
          
          timeoutRef.current = setTimeout(async () => {
            retryAttemptsRef.current += 1;
            await fetchInitialSession();
          }, delay);
        } else if (isMounted) {
          safeError('Número máximo de reintentos alcanzado');
          setIsLoading(false);
          setAuthError('No se pudo cargar la sesión después de varios intentos');
        }
      }
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // Verificar si componente sigue montado antes de actualizar estado
        if (!isMounted) return;
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          safeLog('Sesión inicial encontrada');
          setSession(data.session);
          setUser(data.session.user);
          
          // Ahora intentamos obtener el perfil
          safeLog('Obteniendo perfil para sesión inicial');
          const fetchedProfile = await fetchProfileFromSupabase(data.session.user.id);
          
          // Verificar nuevamente si el componente sigue montado
          if (isMounted && fetchedProfile) {
            setProfile(fetchedProfile);
          }
        }
        
        // Marcar carga inicial como completada
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        safeError('Error al obtener sesión inicial:', err);
        if (isMounted) {
          retryFetchSession();
        }
      }
    }
    
    fetchInitialSession();
    
    // Limpiar suscripción al desmontar
    return () => {
      isMounted = false;
    };
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente

  // Efecto para gestionar el cambio de usuario y la sesión
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Suscribirse a los cambios de autenticación - solo una vez
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        safeLog(`Evento de autenticación: ${event}`);
        
        // Verificar que el componente aún esté montado antes de actualizar el estado
        if (!isMounted) return;
        
        // Limpiar cualquier error previo
        setAuthError(null);
        
        // Actualizar estado solo si hay un cambio real en la sesión o usuario
        const newUser = newSession?.user || null;
        
        // Actualizamos los estados basados en el evento
        if (event === 'SIGNED_IN') {
          safeLog('Usuario ha iniciado sesión');
          setIsLoading(true); // Marcar como cargando mientras procesamos
          
          try {
            setSession(newSession);
            setUser(newUser);
            
            if (newUser) {
              // Intento usar caché primero
              const cachedProfile = getCachedProfile(newUser.id);
              if (cachedProfile) {
                safeLog('Usando perfil en caché para SIGNED_IN');
                setProfile(cachedProfile);
              } else {
                // Solo hacemos una llamada a la API si no está en caché
                safeLog('Obteniendo perfil tras SIGNED_IN');
                const fetchedProfile = await fetchProfileFromSupabase(newUser.id);
                if (fetchedProfile && isMounted) {
                  setProfile(fetchedProfile);
                }
              }
            }
          } catch (error) {
            safeError('Error procesando evento SIGNED_IN:', error);
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        } 
        else if (event === 'SIGNED_OUT') {
          safeLog('Usuario ha cerrado sesión');
          setSession(null);
          setUser(null);
          setProfile(null);
          clearProfileCache();
        }
        else if (event === 'USER_UPDATED' && newUser) {
          safeLog('Usuario actualizado, refrescando perfil');
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
      safeLog('Limpiando suscripción de autenticación');
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
    authError,
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
