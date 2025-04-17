"use client";

import { useState, useEffect } from "react";

/**
 * Hook personalizado para detectar media queries
 * @param query String de media query (por ejemplo: "(max-width: 768px)")
 * @returns boolean que indica si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  // Estado inicial que coincide con el SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // En el cliente, verificamos si window existe
    if (typeof window !== "undefined") {
      // Función para actualizar el estado
      const updateMatches = () => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);
      };

      // Inicializar el estado
      updateMatches();

      // Configurar un listener para cambios
      const mediaQuery = window.matchMedia(query);
      
      // Compatibilidad con navegadores más antiguos
      const listener = () => updateMatches();
      
      // Añadir el listener utilizando la API disponible
      // Definición de tipo para permitir ambas APIs sin errores de compilación
      const mql = mediaQuery as MediaQueryList & {
        addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
        removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      };
      
      if (mql.addEventListener) {
        mql.addEventListener("change", listener);
      } else if (mql.addListener) {
        mql.addListener(listener);
      }

      // Limpiar al desmontar
      return () => {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", listener);
        } else if (mql.removeListener) {
          mql.removeListener(listener);
        }
      };
    }
    
    // Si window no está disponible (SSR), devolvemos falso por defecto
    return undefined;
  }, [query]);

  return matches;
}
