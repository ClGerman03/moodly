"use client";

import { useAuth } from "@/contexts/AuthContext";
import HeaderOptions from "./components/HeaderOptions";
import BoardsSection from "./components/BoardsSection";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  // Obtenemos el user y el estado de carga para la autenticación
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Efecto para redirigir al usuario si no está autenticado
  useEffect(() => {
    // Solo verificar después de que se haya completado la carga inicial
    if (!isLoading && !user) {
      console.log("Usuario no autenticado, redirigiendo a /auth");
      router.replace("/auth");
    }
  }, [user, isLoading, router]);

  // Si estamos cargando o redirigiendo, mostrar un estado de carga
  if (isLoading || (!user && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-2">Verificando sesión...</p>
          <div className="w-10 h-10 border-t-2 border-gray-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto p-6 pt-10">
        {/* Header with title and user options */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light text-gray-800">
            Dashboard
          </h1>
          
          {/* Header options component that includes ProfilePopover */}
          <HeaderOptions />
        </div>
        
        {/* Brief description */}
        <p className="text-gray-500 mb-6">
          Manage your visual boards, create new ones or access existing ones.
        </p>
        
        {/* Boards section - solo se muestra si hay un usuario autenticado */}
        <BoardsSection />
      </div>
    </div>
  );
}
