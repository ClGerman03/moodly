"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Manejar la transición suave hacia la página de autenticación
  const handleCreateBoard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsTransitioning(true);
    
    // Esperar a que termine la animación antes de navegar
    setTimeout(() => {
      router.push("/auth");
    }, 400); // Duración de la animación
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-white transition-all duration-500 ease-in-out"
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <main className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center space-y-10">
        {/* Imagen sin fondo circular */}
        <Image
          src="/images/Moodly.png"
          alt="Moodly-Logo"
          width={176}
          height={176}
          className="object-contain"
          priority
        />
        
        <div className="space-y-4 transition-all duration-500">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-800">
            Crea tu tablero Moodly
          </h1>
          <p className="text-gray-500 font-light">
            En segundos sin registrarte
          </p>
        </div>

        <Link 
          href="/auth" 
          className="px-6 py-2.5 text-white bg-gray-800 hover:bg-gray-700 rounded-full font-light tracking-wide transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 opacity-90 hover:opacity-100"
          onClick={handleCreateBoard}
        >
          Crear tablero
        </Link>

        <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 font-light">
          Diseña • Comparte • Inspira
        </div>
      </main>
    </motion.div>
  );
}
