"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LucideCheck, LucideX } from "lucide-react";
import { boardService, sectionService } from "@/services";
import { storageService } from "@/services/storageService";
import { toast } from "react-hot-toast";
import { Section, ImageMetadata } from "@/app/tablero/types";
import { supabase } from "@/lib/supabase";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  boardName: string;
  boardId?: string;
  currentSections: Section[]; // Secciones actuales del tablero
  onPublish: (slug: string) => void;
}

/**
 * Component for sharing the board via a custom URL
 */
const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  boardName,
  boardId = "mi-tablero",
  currentSections = [], // Usar secciones actuales del estado local
  onPublish
}) => {
  // Estado para la URL personalizada
  const [customUrlSegment, setCustomUrlSegment] = useState(() => {
    // Generar un slug basado en el nombre del tablero
    return boardName
      ? boardName.toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      : boardId
  });
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  const [publishingError, setPublishingError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [historyStateAdded, setHistoryStateAdded] = useState(false);
  const [boardLink, setBoardLink] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  
  // Referencias para detectar clics fuera del popup
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Cerrar popup con escape o clic fuera
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleEscKey);
      window.addEventListener("mousedown", handleClickOutside);
      
      // Manejar navegación del botón atrás en dispositivos móviles
      if (typeof window !== 'undefined' && !historyStateAdded) {
        window.history.pushState({ popup: true }, "");
        setHistoryStateAdded(true);
      }
    }
    
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, historyStateAdded]);
  
  // Manejar el evento popstate (botón atrás del navegador)
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen && historyStateAdded) {
        onClose();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
      
      // Al desmontar, limpiar el estado del historial si fuimos nosotros quienes lo añadimos
      if (historyStateAdded && isOpen) {
        setHistoryStateAdded(false);
      }
    };
  }, [isOpen, historyStateAdded, onClose]);
  
  // Publicar tablero con URL personalizada
  const handlePublish = async () => {
    try {
      // Verificar que el slug sea válido
      if (!customUrlSegment || customUrlSegment.trim() === "") {
        setPublishingError("Please enter a valid name for the URL");
        return;
      }
      
      // Slug normalizado
      const finalSlug = customUrlSegment
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      
      // Verificar disponibilidad del slug en Supabase
      setIsChecking(true);
      try {
        const isAvailable = await boardService.isSlugAvailable(finalSlug);
        if (!isAvailable) {
          setPublishingError("This URL is already taken. Please try a different one.");
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error("Error checking slug availability:", error);
        setPublishingError("Error checking URL availability. Please try again.");
        setIsChecking(false);
        return;
      }
      
      // Antes de publicar, procesar las imágenes del tablero
      const migrationToast = toast.loading("Preparing board for publication...");
      
      try {
        // Usar las secciones actuales del estado local en lugar de obtenerlas de la base de datos
        if (!currentSections || currentSections.length === 0) {
          toast.dismiss(migrationToast);
          setIsChecking(false);
          setPublishingError("No sections found for this board");
          return;
        }
        
        // Procesar cada sección para migrar las imágenes
        // Siempre asumimos cambios para simplificar el flujo
        // const hasChanges = true; // Variable no utilizada en la lógica actual
        const processedSections = await Promise.all(
          currentSections.map(async (section) => {
            // Solo procesar secciones de tipo imageGallery
            if (section.type !== 'imageGallery') {
              return section;
            }
            
            try {
              // Crear un formato compatible con processSectionImages
              const sectionToProcess = {
                type: section.type,
                data: section.data
              };
              
              // Usar directamente el procesador de imágenes del storageService
              const processedSection = await storageService.processSectionImages(sectionToProcess, boardId);
              
              // Asegurar que imageMetadata sea del tipo correcto
              const typedData = { ...processedSection.data };
              
              // Convertir los metadatos de imagen al tipo esperado
              if (typedData.imageMetadata) {
                const typedMetadata: { [key: string]: ImageMetadata } = {};
                
                // Convertir cada entrada de metadatos al tipo ImageMetadata
                Object.entries(typedData.imageMetadata).forEach(([key, value]) => {
                  if (value && typeof value === 'object') {
                    const rawValue = value as Record<string, unknown>;
                    typedMetadata[key] = {
                      title: typeof rawValue.title === 'string' ? rawValue.title : undefined,
                      description: typeof rawValue.description === 'string' ? rawValue.description : undefined
                    };
                  }
                });
                
                typedData.imageMetadata = typedMetadata;
              }
              
              return {
                ...section,
                data: typedData
              };
            } catch (error) {
              console.error(`Error processing images for section ${section.id}:`, error);
              // Continuar con otras secciones incluso si esta falla
              return section;
            }
          })
        );
        
        // Declarar finalBoardId fuera del bloque condicional
        let finalBoardId = boardId;
        
        // Si el boardId es un valor por defecto, crear el tablero primero
        if (boardId === "mi-tablero" || !boardId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const newBoard = await boardService.createBoard({
            name: boardName,
            slug: finalSlug,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            is_published: true
          });
          finalBoardId = newBoard.id;
        }
        
        // Guardar las secciones (procesadas o no)
        await sectionService.saveSections(finalBoardId, processedSections as Section[]);
        toast.success("Board published successfully", { id: migrationToast });
        
        // Publicar el tablero en Supabase si todavía no se ha hecho
        if (boardId !== finalBoardId) {
          await boardService.publishBoard(finalBoardId, finalSlug);
        }
        
        // Generar el enlace completo para compartir
        const baseUrl = window.location.origin;
        const fullBoardLink = `${baseUrl}/board/${finalSlug}`;
        setBoardLink(fullBoardLink);
        
        // Actualizar estado y mostrar mensaje de éxito
        setShowUrlSuccess(true);
        setIsPublished(true);
        
        // Notificar al componente padre
        onPublish(finalSlug);
      } catch (error) {
        console.error("Error preparing board:", error);
        toast.error(`Error preparing board: ${error instanceof Error ? error.message : "Unknown error"}`, { id: migrationToast });
        setPublishingError("Error preparing board. Please try again.");
        setIsChecking(false);
        return;
      }
      
      setIsChecking(false);
    } catch (error) {
      console.error("Error publishing board:", error);
      setPublishingError(`Error publishing board: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
          
          {/* Popup */}
          <motion.div
            ref={popupRef}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
                Share your board
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              >
                <LucideX size={18} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Sección de URL personalizada */}
              <div className="flex flex-col mb-2">
                <label htmlFor="custom-url" className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Custom URL
                </label>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center px-3 bg-gray-50 dark:bg-gray-800 border-r-0 border-0 rounded-l-md text-sm text-gray-500 dark:text-gray-400">
                    {window.location.origin}/board/
                  </div>
                  <input
                    id="custom-url"
                    type="text"
                    value={customUrlSegment}
                    onChange={(e) => setCustomUrlSegment(e.target.value.replace(/\s+/g, '-'))}
                    className="flex-1 px-3 py-2 text-sm rounded-r-md border-0 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700"
                    placeholder="mi-tablero"
                  />
                </div>
              </div>
              
              {/* Mensaje de error de publicación */}
              {publishingError && (
                <div className="p-2 mb-1 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {publishingError}
                </div>
              )}
              
              {/* Mensaje de éxito */}
              <AnimatePresence>
                {showUrlSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2 mb-1 text-xs flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md"
                  >
                    <LucideCheck size={14} className="mr-1.5" />
                    Board published successfully!
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Botón de publicar */}
              <button
                onClick={handlePublish}
                disabled={isChecking || isPublished}
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  isPublished
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : isChecking
                    ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-wait"
                    : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                }`}
              >
                {isPublished ? (
                  <span className="flex items-center justify-center">
                    <LucideCheck size={16} className="mr-1.5" />
                    Published
                  </span>
                ) : isChecking ? (
                  "Checking availability..."
                ) : (
                  "Publish board"
                )}
              </button>
              
              {/* Enlace para compartir */}
              {isPublished && boardLink && (
                <div className="mt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Share this link with others:
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={boardLink}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm rounded-l-md border-0 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(boardLink);
                        // Feedback visual (opcional)
                        const copyBtn = document.activeElement as HTMLButtonElement;
                        if (copyBtn) {
                          const originalText = copyBtn.textContent;
                          copyBtn.textContent = "Copied!";
                          setTimeout(() => {
                            copyBtn.textContent = originalText;
                          }, 2000);
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-r-md"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 text-center">
              Anyone with the link will be able to view the board
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharePopup;
