"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Mostrar el mensaje de bienvenida por 2 segundos y luego el contenido principal
  useEffect(() => {
    // Mostrar el mensaje de bienvenida durante 2 segundos
    const welcomeTimer = setTimeout(() => {
      // Iniciar el fade out del mensaje de bienvenida
      setShowWelcome(false);
      
      // Esperar a que termine el fade out antes de mostrar el contenido principal
      setTimeout(() => {
        setShowContent(true);
      }, 500); // Duración del fade out del mensaje de bienvenida
    }, 2000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // Handle smooth transition to the authentication page
  const handleCreateBoard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsTransitioning(true);
    
    // Wait for the animation to finish before navigating
    setTimeout(() => {
      router.push("/auth");
    }, 400); // Animation duration
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-white transition-all duration-500 ease-in-out"
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait">
        {/* Mensaje de bienvenida con animación */}
        {showWelcome && (
          <motion.div 
            className="flex flex-col items-center justify-center h-screen w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            key="welcome"
          >
            <h1 className="text-4xl font-light text-gray-800">
              BETA Version
            </h1>
          </motion.div>
        )}

        {/* Contenido principal */}
        {showContent && (
          <motion.main 
            className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", staggerChildren: 0.2 }}
            key="main-content"
          >
            {/* Logo image with transparent background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/Moodly.png"
                alt="Moodly-Logo"
                width={176}
                height={176}
                className="object-contain"
                priority
              />
            </motion.div>
            
            <motion.div 
              className="space-y-4 transition-all duration-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-800">
                Create your Moodly board
              </h1>
              <p className="text-gray-500 font-light">
                Get feedback in minutes without friction
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link 
                href="/auth" 
                className="px-6 py-2.5 text-white bg-gray-800 hover:bg-gray-700 rounded-full font-light tracking-wide transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 opacity-90 hover:opacity-100"
                onClick={handleCreateBoard}
              >
                Create Board
              </Link>
            </motion.div>

            <motion.div 
              className="text-xs text-gray-400 dark:text-gray-500 mt-8 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Design • Share • Inspire
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
