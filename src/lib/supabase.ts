/**
 * Cliente de Supabase
 * 
 * Este archivo configura y exporta el cliente de Supabase para toda la aplicación.
 * Se utiliza para interactuar con la base de datos, autenticación y almacenamiento.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Obtener las credenciales desde las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificación de variables de entorno en desarrollo
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Función auxiliar para obtener la URL de redirección después del inicio de sesión
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  
  // Make sure to include trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  
  return url
}
