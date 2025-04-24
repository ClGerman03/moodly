'use client'

/**
 * Proveedores globales de la aplicación
 * 
 * Este componente envuelve toda la aplicación y proporciona
 * los contextos necesarios, como autenticación y React Query.
 */

import { useState, useEffect, ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export function Providers({ children }: { children: ReactNode }) {
  // Para evitar la hidratación incorrecta con next-themes
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
              }
            }}
          />
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
