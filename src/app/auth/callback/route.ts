/**
 * Manejador de callback para OAuth
 * 
 * Este archivo maneja la redirección después del inicio de sesión con OAuth (Google).
 * Procesa el código de autorización y redirige al usuario a la página apropiada.
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Obtener los parámetros de la URL
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Crear un cliente de Supabase que funcione en el servidor
    const supabase = createRouteHandlerClient({ cookies })
    
    // Intercambiar el código de autorización por una sesión
    await supabase.auth.exchangeCodeForSession(code)
  }
  
  // Redirigir al dashboard o a la página anterior si existe en la URL
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
