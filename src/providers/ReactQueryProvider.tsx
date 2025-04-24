'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * ReactQueryProvider
 * 
 * Proveedor global para React Query que permite la gestión de caché y estado de consultas
 * en toda la aplicación. Implementa buenas prácticas como:
 * - Un nuevo QueryClient por cada request para evitar datos compartidos entre usuarios
 * - Configuración de staleTime por defecto para reducir solicitudes innecesarias
 */
export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Crear una instancia nueva de QueryClient para cada request, siguiendo las buenas prácticas
  // para aplicaciones Next.js con React Server Components
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // No ejecutar consultas durante SSR para evitar datos obsoletos
            // suspense: false, // Comentada porque no es compatible con esta versión
            // Considerar datos frescos durante 1 minuto antes de refetch en background
            staleTime: 60 * 1000,
            // Mantener datos en caché por 5 minutos incluso después de desmontarse
            gcTime: 5 * 60 * 1000,
            // No revalidar al recuperar foco por defecto (se puede sobreescribir)
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
