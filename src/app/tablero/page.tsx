"use client";

import { useState, useRef } from "react";
import ConfigPanel from './components/ConfigPanel';
import SectionManager from './components/SectionManager';
import { motion, AnimatePresence } from "framer-motion";

export default function Tablero() {
  const [boardName, setBoardName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showNameForm, setShowNameForm] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar la configuración del nombre del tablero
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boardName.trim()) {
      // Iniciar la transición
      setIsTransitioning(true);
      
      // Esperar a que termine la animación de fade-out antes de mostrar el mensaje de bienvenida
      setTimeout(() => {
        setShowNameForm(false);
        setShowWelcome(true);
        setIsTransitioning(false);
        
        // Después de mostrar el mensaje de bienvenida por un tiempo, mostrar el tablero
        setTimeout(() => {
          setIsTransitioning(true);
          
          setTimeout(() => {
            setShowWelcome(false);
            setIsNameSet(true);
            
            // Iniciar la animación de fade-in para el tablero
            setTimeout(() => {
              setIsTransitioning(false);
            }, 100);
          }, 2000); // Duración del fade out del mensaje (2 segundos)
        }, 2000); // Tiempo que se mantiene visible el mensaje (3 segundos + 2 segundos de transiciones)
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-white transition-all duration-500 ease-in-out">
      {/* Pantalla para configurar el nombre del tablero - Con transición suave */}
      <AnimatePresence>
        {showNameForm && (
          <motion.div 
            className="flex flex-col items-center justify-center h-screen w-full max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <h1 className="mb-8 text-2xl font-light text-gray-800 tracking-wide">
              ¿Cómo se llamará tu tablero?
            </h1>
            <form onSubmit={handleNameSubmit} className="w-full space-y-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Escribe un nombre"
                  className="w-full py-3 text-xl text-center text-gray-700 placeholder-gray-400/60 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-400 transition-all duration-300"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full max-w-xs mx-auto px-4 py-2 mt-8 font-medium text-white transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transform hover:scale-102 opacity-90 hover:opacity-100 flex items-center justify-center"
              >
                Comenzar
              </button>
            </form>
          </motion.div>
        )}

        {/* Mensaje de bienvenida con animación */}
        {showWelcome && (
          <motion.div 
            className="flex flex-col items-center justify-center h-screen w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <h1 className="text-3xl font-light text-gray-800">
              Bienvenido
            </h1>
          </motion.div>
        )}

        {/* Pantalla del tablero con transición suave */}
        {isNameSet && (
          <motion.div 
            className="w-full max-w-6xl mx-auto p-6 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-light text-gray-800 dark:text-gray-100">
                {boardName}
              </h1>
              <ConfigPanel 
                isLiveMode={isLiveMode}
                onToggleLiveMode={() => setIsLiveMode(!isLiveMode)}
              />
            </div>
            
            {/* Gestor de secciones */}
            <SectionManager 
              fileInputRef={fileInputRef}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
