"use client";

import { useState, useRef, useEffect } from "react";
import ConfigPanel from './components/ConfigPanel';
import SectionManager from './components/SectionManager';
import SharePopup from './components/popups/SharePopup';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Section } from './types';

export default function Tablero() {
  const [boardName, setBoardName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showNameForm, setShowNameForm] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [publishedSlug, setPublishedSlug] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionManagerRef = useRef<{ getSections: () => Section[] }>(null);
  
  // Obtener el estado de autenticación
  const { user, isLoading } = useAuth();
  
  // Efecto para manejar el estado inicial según si el usuario está autenticado
  // Se ejecuta cuando isLoading cambia de true a false
  useEffect(() => {
    // Solo realizar acciones después de que se haya cargado el estado de autenticación
    if (!isLoading) {
      // Opcional: pre-configurar el tablero si el usuario está autenticado
      if (user && !isNameSet && boardName === "") {
        // Aquí podríamos establecer un nombre predeterminado o cargar el último tablero
        // (Por ahora no implementamos ninguna acción específica)
      }
    }
  }, [isLoading, user, isNameSet, boardName]); // Incluimos todas las dependencias utilizadas
  
  // Función para manejar la publicación del tablero
  const handlePublishBoard = (slug: string) => {
    try {
      // Verificar que el SectionManager tenga una referencia válida
      if (!sectionManagerRef.current) {
        console.error("No se puede acceder a las secciones del tablero");
        return;
      }
      
      // Obtener las secciones actuales del tablero (ya procesadas por prepareForStorage)
      const sections = sectionManagerRef.current.getSections();
      console.log('Publicando tablero - Secciones procesadas:', sections);
      
      // Crear un objeto con los datos del tablero
      const boardData = {
        name: boardName,
        sections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: true,
        userId: user?.id || "anonymous",
      };
      
      // Serializar a JSON y guardar en localStorage
      const serializedData = JSON.stringify(boardData);
      console.log('Tamaño de datos serializados:', serializedData.length, 'bytes');
      console.log('Clave de localStorage:', `moodly-board-${slug}`);
      localStorage.setItem(`moodly-board-${slug}`, serializedData);
      
      // Actualizar el estado
      setIsPublished(true);
      setPublishedSlug(slug);
      
      // URL completa para compartir
      const shareUrl = `${window.location.origin}/board/${slug}`;
      console.log('URL para compartir:', shareUrl);
      
      console.log(`Tablero publicado con slug: ${slug}`);
    } catch (error) {
      console.error("Error al publicar el tablero:", error);
    }
  };

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
            <h1 className="mb-6 text-2xl font-light text-gray-800 tracking-wide">
              What will you name your board?
            </h1>
            <form onSubmit={handleNameSubmit} className="w-full space-y-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Enter a name"
                  className="w-full py-2 text-xl text-center text-gray-700 placeholder-gray-300/70 bg-transparent outline-none focus:outline-none focus:ring-0 focus:shadow-none transition-all duration-300"
                  autoFocus
                  style={{ outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                className="w-auto px-5 py-1.5 mt-4 text-sm font-medium text-white transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transform hover:scale-102 opacity-90 hover:opacity-100 flex items-center justify-center mx-auto"
              >
                Start
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
              {user ? `Welcome, ${user.email?.split('@')[0]}` : "Welcome"}
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
                onShare={() => setIsSharePopupOpen(true)}
              />
            </div>
            
            {/* Gestor de secciones */}
            <SectionManager 
              fileInputRef={fileInputRef}
              isLiveMode={isLiveMode}
              ref={sectionManagerRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup para compartir el tablero */}
      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={() => setIsSharePopupOpen(false)}
        boardName={boardName}
        boardId={publishedSlug || boardName.toLowerCase().replace(/\s+/g, '-')}
        onPublish={handlePublishBoard}
      />
    </div>
  );
}
