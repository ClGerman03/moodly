/**
 * Sistema de caché para perfiles de usuario
 * 
 * Este servicio implementa un sistema de caché para reducir las llamadas
 * a la tabla de perfiles en Supabase. Almacena los perfiles en localStorage
 * con un tiempo de expiración (TTL).
 */

import { Database } from '@/types/supabase';

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
type ProfileType = Database['public']['Tables']['profiles']['Row'];

// Tipo para el objeto de caché almacenado
interface ProfileCache {
  profile: ProfileType;
  timestamp: number;
  userId: string;
}

// Aumentar el tiempo de caché para reducir consultas frecuentes a la base de datos
// Especialmente importante para evitar problemas cuando la app vuelve de segundo plano
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Función para generar la clave de caché específica para el usuario
const getProfileCacheKey = (userId: string) => `moodly-profile-cache-${userId}`;

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
      const cacheKey = getProfileCacheKey(userId);
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      safeLog(`Perfil almacenado en caché para usuario: ${userId}`);
    }
  } catch (error) {
    // Error al guardar en localStorage - solo registrar, no interrumpir
    safeError('Error al guardar perfil en caché:', error);
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
    // Obtener la clave de caché específica para este usuario
    const cacheKey = getProfileCacheKey(userId);
    
    // Intentar recuperar del localStorage
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) {
      safeLog(`No hay caché disponible para usuario: ${userId}`);
      return null;
    }
    
    // Parsear los datos con manejo de errores
    let cache: ProfileCache;
    try {
      cache = JSON.parse(cachedData);
      
      // Verificar integridad de los datos
      if (!cache || !cache.profile || !cache.timestamp || !cache.userId) {
        safeLog(`Datos de caché inválidos para usuario: ${userId}, limpiando caché`);
        localStorage.removeItem(cacheKey);
        return null;
      }
    } catch (parseError) {
      // Error al parsear JSON, limpiar la caché corrupta
      safeError(`Error al parsear caché para usuario: ${userId}`, parseError);
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Comprobar si ha expirado
    const now = Date.now();
    const isExpired = now - cache.timestamp > CACHE_TTL;
    
    if (isExpired) {
      safeLog(`Caché expirada para usuario: ${userId}`);
      // Eliminar la caché si ha expirado
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    safeLog(`Usando caché válida para usuario: ${userId}`);
    // Devolver el perfil si es válido
    return cache.profile;
  } catch (error) {
    safeError('Error al recuperar perfil de caché:', error);
    return null;
  }
};

/**
 * Elimina el perfil almacenado en caché para un usuario específico
 * @param userId ID del usuario cuya caché se debe limpiar (opcional)
 */
export const clearProfileCache = (userId?: string): void => {
  try {
    if (typeof window !== 'undefined') {
      if (userId) {
        // Limpiar solo la caché del usuario específico
        const cacheKey = getProfileCacheKey(userId);
        localStorage.removeItem(cacheKey);
        safeLog(`Caché de perfil eliminada para usuario: ${userId}`);
      } else {
        // Buscar y eliminar todas las claves de caché de perfil
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('moodly-profile-cache-')) {
            keysToRemove.push(key);
          }
        }
        
        // Eliminar cada clave encontrada
        keysToRemove.forEach(key => localStorage.removeItem(key));
        safeLog(`Se eliminaron ${keysToRemove.length} cachés de perfil`);
      }
    }
  } catch (error) {
    safeError('Error al limpiar caché de perfil:', error);
  }
};
