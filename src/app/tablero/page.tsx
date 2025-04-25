"use client";

import { useState, useRef, useEffect } from "react";
import ConfigPanel from './components/ConfigPanel';
import SectionManager from './components/SectionManager';
import SharePopup from './components/popups/SharePopup';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Section } from './types';
import { boardService, sectionService } from "@/services";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Tablero() {
  const [boardName, setBoardName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showNameForm, setShowNameForm] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [publishedSlug, setPublishedSlug] = useState<string>("");
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [currentSections, setCurrentSections] = useState<Section[]>([]);
  // Variable utilizada en la función handlePublishBoard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionManagerRef = useRef<{ getSections: () => Section[] }>(null);
  
  // Obtener el estado de autenticación
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
  const handlePublishBoard = async (slug: string) => {
    try {
      setIsPublishing(true);
      
      // Verificar que el SectionManager tenga una referencia válida
      if (!sectionManagerRef.current) {
        console.error("No se puede acceder a las secciones del tablero");
        toast.error("Error accessing board sections");
        setIsPublishing(false);
        return;
      }
      
      // Verificar que el usuario esté autenticado
      if (!user) {
        console.error("User not authenticated");
        toast.error("You must be logged in to publish a board");
        setIsPublishing(false);
        return;
      }
      
      // Obtener las secciones actuales del tablero (ya procesadas por prepareForStorage)
      const sections = sectionManagerRef.current.getSections();
      console.log('Publicando tablero - Secciones procesadas:', sections);
      
      // Crear un objeto con los datos del tablero para Supabase
      const boardData = {
        slug: slug,
        name: boardName,
        user_id: user.id,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      let boardId = currentBoardId;
      
      // Si no tenemos un ID de tablero, creamos uno nuevo
      if (!boardId) {
        try {
          const createdBoard = await boardService.createBoard(boardData);
          boardId = createdBoard.id;
          setCurrentBoardId(boardId);
        } catch (error) {
          console.error("Error creating board:", error);
          toast.error("Error creating board");
          setIsPublishing(false);
          return;
        }
      } else {
        // Si ya tenemos un ID, actualizamos el tablero existente
        try {
          await boardService.updateBoard(boardId, {
            slug: slug,
            name: boardName,
            is_published: true,
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating board:", error);
          toast.error("Error updating board");
          setIsPublishing(false);
          return;
        }
      }
      
      // Guardar las secciones
      try {
        if (boardId) {
          await sectionService.saveSections(boardId, sections);
        }
      } catch (error) {
        console.error("Error guardando secciones:", error);
        toast.error("Error saving sections");
        setIsPublishing(false);
        return;
      }
      
      // Para compatibilidad, seguimos guardando en localStorage temporalmente
      try {
        // Crear un objeto con los datos del tablero para localStorage (formato actual)
        const legacyBoardData = {
          name: boardName,
          sections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: true,
          userId: user.id,
        };
        
        // Serializar a JSON y guardar en localStorage
        const serializedData = JSON.stringify(legacyBoardData);
        localStorage.setItem(`moodly-board-${slug}`, serializedData);
      } catch (error) {
        console.error("Error al guardar en localStorage:", error);
        // No mostramos error al usuario ya que Supabase es ahora el almacenamiento principal
      }
      
      // Actualizar el estado
      setIsPublished(true);
      setPublishedSlug(slug);
      
      // URL completa para compartir
      const shareUrl = `${window.location.origin}/board/${slug}`;
      console.log('URL para compartir:', shareUrl);
      
      toast.success("Board published successfully!");
      console.log(`Tablero publicado con slug: ${slug}`);
    } catch (error) {
      console.error("Error al publicar el tablero:", error);
      toast.error("Error publishing board");
    } finally {
      setIsPublishing(false);
    }
  };

  // Función para obtener las secciones actuales cuando se abre el popup
  const handleOpenSharePopup = () => {
    // Actualizar las secciones actuales desde el sectionManagerRef
    if (sectionManagerRef.current) {
      setCurrentSections(sectionManagerRef.current.getSections());
    }
    setIsSharePopupOpen(true);
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
        
        // Esperar a que el mensaje de bienvenida esté visible antes de transicionar a la pantalla principal
        setTimeout(() => {
          // Iniciar fade-out del mensaje de bienvenida
          setIsTransitioning(true);
          
          // Esperar a que termine el fade-out antes de mostrar la pantalla principal
          setTimeout(() => {
            setShowWelcome(false);
            setIsNameSet(true);
            
            // Aseguramos que la transición a la pantalla principal sea suave
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
      {/* Mostrar loading state mientras se verifica la autenticación */}
      {isLoading || (!user && typeof window !== "undefined") ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-gray-600 mb-2">Verificando sesión...</p>
            <div className="w-10 h-10 border-t-2 border-gray-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      ) : (
        <>
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
                    onShare={handleOpenSharePopup}
                  />
                </div>
                
                {/* Gestor de secciones */}
                <SectionManager 
                  fileInputRef={fileInputRef}
                  ref={sectionManagerRef}
                  boardId={currentBoardId || `temp-${Date.now().toString()}`} // Usar ID actual o generar uno temporal
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popup para compartir el tablero */}
          <SharePopup
            isOpen={isSharePopupOpen}
            onClose={() => setIsSharePopupOpen(false)}
            boardName={boardName}
            boardId={currentBoardId || publishedSlug || boardName.toLowerCase().replace(/\s+/g, '-')}
            currentSections={currentSections}
            onPublish={handlePublishBoard}
          />
        </>
      )}
    </div>
  );
}
