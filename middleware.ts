import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de autenticación para Moodly
 * 
 * Este middleware intercepta las solicitudes y verifica el estado de autenticación
 * del usuario. Protege rutas específicas, gestiona redirecciones según el estado
 * de autenticación y asegura que las cookies de sesión se mantengan actualizadas.
 */
export async function middleware(req: NextRequest) {
  // Crear una respuesta inicialmente vacía que continuará la cadena de middleware
  const res = NextResponse.next();
  
  // Crear un cliente de Supabase específico para el middleware
  // Esto permite verificar la sesión y actualizar las cookies de forma segura
  const supabase = createMiddlewareClient({ req, res });

  // Verificar si hay una sesión activa a través de las cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Obtener información sobre la URL solicitada
  const requestUrl = new URL(req.url);
  const path = requestUrl.pathname;

  // Definir las áreas de la aplicación
  // 1. Rutas que requieren autenticación para ciertas operaciones
  // Nota: En Moodly, el tablero es accesible sin autenticación, pero ciertas
  // operaciones como guardar o compartir tableros podrían requerir autenticación
  const PROTECTED_OPERATIONS = [
    '/tablero/guardar',     // Guardar un tablero (requiere cuenta)
    '/tablero/compartir',   // Compartir un tablero (requiere cuenta)
    '/perfil',              // Acceso al perfil de usuario
    '/mis-tableros',        // Lista de tableros guardados
    '/dashboard'            // Dashboard de tableros del usuario
  ];

  // 2. Rutas de autenticación específicas
  // Si el usuario ya está autenticado, no debería ver estas rutas
  const AUTH_ROUTES = ['/auth'];
  
  // 3. Ruta de callback que NO debe ser interceptada
  // Esta ruta es manejada por el route handler específico para OAuth
  const CALLBACK_ROUTE = '/auth/callback';

  // Rutas especiales que no deben ser interceptadas
  // La ruta de logout permite que el proceso de cierre de sesión se complete sin interferencias
  
  // Verificar tipo de ruta
  const isCallbackRoute = path.startsWith(CALLBACK_ROUTE);
  const isLogoutRoute = path === '/' && requestUrl.searchParams.get('logout') === 'true'; 
  const isProtectedOperation = PROTECTED_OPERATIONS.some(route => path.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route)) && !isCallbackRoute;

  // No interceptar la ruta de callback ni la ruta de logout
  if (isCallbackRoute || isLogoutRoute) {
    return res;
  }

  // Redireccionar según estado de sesión y tipo de ruta
  // 1. Si intenta acceder a una operación protegida sin sesión
  if (isProtectedOperation && !session) {
    // Log para depuración
    console.log(`Redirección de ruta protegida: ${path} - sin sesión`);
    
    // Guardar la URL actual para redirigir de vuelta después del login
    const returnUrl = encodeURIComponent(req.url);
    return NextResponse.redirect(new URL(`/auth?returnUrl=${returnUrl}`, requestUrl.origin));
  }

  // 2. Si intenta acceder a una ruta de auth ya estando autenticado
  if (isAuthRoute && session) {
    // Obtener la URL de retorno si existe, sino ir al tablero
    const returnUrl = requestUrl.searchParams.get('returnUrl');
    return NextResponse.redirect(new URL(returnUrl || '/tablero', requestUrl.origin));
  }

  // Permitir el acceso a todas las demás rutas
  // Esto mantiene las cookies de sesión actualizadas gracias al cliente de Supabase
  return res;
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  // Aplicar a todas las rutas excepto a las estáticas y archivos públicos
  matcher: [
    // Excluir archivos estáticos, API routes, etc.
    '/((?!_next/static|_next/image|favicon.ico|images/|public/|api/).*)',
  ],
};
