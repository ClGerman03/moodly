/**
 * Sistema de caché para perfiles de usuario
 * 
 * Este servicio implementa un sistema de caché para reducir las llamadas
 * a la tabla de perfiles en Supabase. Almacena los perfiles en localStorage
 * con un tiempo de expiración (TTL).
 */

import { Database } from '@/types/supabase';

// Tipo para el perfil de usuario
type ProfileType = Database['public']['Tables']['profiles']['Row'];

// Clave para almacenar el perfil en localStorage
const PROFILE_CACHE_KEY = 'moodly-profile-cache';

// Tiempo de expiración en milisegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

// Tipo para el objeto de caché almacenado
interface ProfileCache {
  profile: ProfileType;
  timestamp: number;
  userId: string;
}

/**
 * Guarda un perfil de usuario en la caché
 * @param userId ID del usuario
 * @param profile Datos del perfil
 */
export const cacheProfile = (userId: string, profile: ProfileType): void => {
  if (!userId || !profile) return;
  
  // Datos para guardar en caché
  const cacheData: ProfileCache = {
    profile,
    timestamp: Date.now(),
    userId
  };
  
  try {
    // Solo almacenar en localStorage en el cliente
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
    }
  } catch (error) {
    // Error al guardar en localStorage - solo registrar, no interrumpir
    console.error('Error al guardar perfil en caché:', error);
  }
};

/**
 * Obtiene un perfil de usuario desde la caché si está disponible y no ha expirado
 * @param userId ID del usuario a buscar
 * @returns El perfil almacenado en caché o null si no existe o ha expirado
 */
export const getCachedProfile = (userId: string): ProfileType | null => {
  if (!userId || typeof window === 'undefined') return null;
  
  try {
    // Intentar recuperar del localStorage
    const cachedData = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cachedData) return null;
    
    // Parsear los datos
    const cache: ProfileCache = JSON.parse(cachedData);
    
    // Verificar que sea el mismo usuario
    if (cache.userId !== userId) return null;
    
    // Comprobar si ha expirado
    const now = Date.now();
    const isExpired = now - cache.timestamp > CACHE_TTL;
    
    if (isExpired) {
      // Eliminar la caché si ha expirado
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    
    // Devolver el perfil si es válido
    return cache.profile;
  } catch (error) {
    console.error('Error al recuperar perfil de caché:', error);
    return null;
  }
};

/**
 * Elimina el perfil almacenado en caché
 */
export const clearProfileCache = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch (error) {
    console.error('Error al limpiar caché de perfil:', error);
  }
};
