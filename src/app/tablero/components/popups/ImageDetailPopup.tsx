"use client";

import React, { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageTagsEditor from "./ImageTagsEditor";
import ImageTags from "./ImageTags";
import { useMediaQuery } from "@/app/tablero/hooks/useMediaQuery";

interface ImageDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string[];
  onSave: (title: string, description: string, tags: string[]) => void;
  isLiveMode?: boolean;
}

// Componente para renderizar la barra de herramientas del editor de texto
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-2 pb-1 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Negrita"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Cursiva"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Lista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Lista numerada"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>
    </div>
  );
};

const ImageDetailPopup: React.FC<ImageDetailPopupProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialTitle = "",
  initialDescription = "",
  initialTags = [],
  onSave,
  isLiveMode = false,
}) => {
  // Guardamos los valores iniciales para referencia y comparación
  const [initialValues] = useState({
    title: initialTitle || "",
    description: initialDescription || "",
    tags: initialTags || [],
  });
  
  // Estados simplificados sin isSaving
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [editingTitle, setEditingTitle] = useState(false);
  const [historyStateAdded, setHistoryStateAdded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [lastSavedState, setLastSavedState] = useState({ title: initialTitle, description: initialDescription, tags: initialTags });
  
  // Detectar si es un dispositivo móvil
  const isMobile = useMediaQuery("(max-width: 768px)");
  const popupRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  // Simplificamos a un solo timeout para guardado
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Configuración del editor de texto enriquecido - simplificada al máximo
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialDescription,
    // Solución al error de SSR
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Actualizar el estado local inmediatamente sin guardar automáticamente
      const html = editor.getHTML();
      setDescription(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[200px] py-2 h-full',
      },
    },
  });

  // Manejar cambios cuando se activa/desactiva el modo live
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLiveMode);
    }
  }, [editor, isLiveMode]);
  
  // Manejar cambios en el estado del popup o la imagen - solo al montar o cuando cambia isOpen
  useEffect(() => {
    if (!isOpen) return;
    
    // Cuando el popup se abre por primera vez, configuramos todos los valores iniciales
    if (!editingTitle) { // Solo si no estamos editando el título
      setTitle(initialTitle || "");
      setTags(initialTags || []);
      setLastSavedState({
        title: initialTitle || "",
        description: initialDescription || "",
        tags: initialTags || []
      });
      
      // Actualizar el contenido del editor si está disponible
      if (editor && editor.commands) {
        editor.commands.setContent(initialDescription || '');
      }
    }
    
    // Manejar navegación del botón atrás en dispositivos móviles
    // Añadir un estado al historial para capturar el evento popstate
    if (typeof window !== 'undefined' && !historyStateAdded) {
      window.history.pushState({ popup: true }, "");
      setHistoryStateAdded(true);
    }
    
    // También resetear el estado de edición del título
    setEditingTitle(false);
    
    // Limpiar cualquier timeout pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Auto-focus en el título solo si está vacío
    const focusTimer = setTimeout(() => {
      if (!initialTitle) {
        setEditingTitle(true);
        titleInputRef.current?.focus();
      }
    }, 100);
    
    // Limpiar el temporizador cuando se desmonte
    return () => clearTimeout(focusTimer);
    
  }, [isOpen, imageUrl, initialTitle, initialDescription, editor, historyStateAdded]); // dependencias necesarias

  // Función muy simplificada para guardar cambios - solo cuando se llama explícitamente
  const handleSaveChanges = useCallback(() => {
    // Guardar los cambios actuales (sin comprobaciones extra)
    onSave(title, description, tags);
    
    // Actualizamos el estado de último guardado
    setLastSavedState({
      title,
      description,
      tags
    });
  }, [title, description, tags, onSave]);

  // Memoizamos handleClose para evitar recreaciones innecesarias
  const handleClose = useCallback(() => {
    // Al cerrar, no guardamos los cambios
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Si añadimos una entrada al historial para este popup, volvemos atrás para que no se acumulen
    if (historyStateAdded && typeof window !== 'undefined') {
      window.history.back();
    }
    
    onClose();
  }, [onClose, historyStateAdded]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    // Handle escape key to close
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, handleClose]);

  // Manejar el evento popstate (botón atrás del navegador)
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen && historyStateAdded) {
        // Prevenir el comportamiento por defecto
        handleClose();
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
  }, [isOpen, historyStateAdded, handleClose]);

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop con efecto mejorado */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />

          {/* Main popup container - Optimizado para móviles con animaciones mejoradas */}
          <motion.div
            ref={popupRef}
            className="relative z-10 max-w-5xl w-[95%] sm:w-[90%] max-h-[95vh] md:max-h-[90vh] overflow-visible flex flex-col gap-4 md:flex-row md:gap-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              mass: 0.8
            }}
          >
            {/* Content section (left side) - Ahora como una tarjeta independiente */}
            <div className="md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col h-full overflow-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">

              <div className="flex flex-col flex-grow mt-6">
                {/* Editable Title - Estilo similar a SectionManager */}
                {!isLiveMode && editingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={(e) => {
                      // Evitar que se cierre inmediatamente cuando hacemos clic para editar
                      // Solo cerramos si dejamos de enfocarlo o presionamos Enter/Escape
                      setTimeout(() => {
                        if (document.activeElement !== titleInputRef.current) {
                          setEditingTitle(false);
                          handleSaveChanges();
                        }
                      }, 100);
                    }}
                    onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        setEditingTitle(false);
                        handleSaveChanges();
                      } else if (e.key === 'Escape') {
                        setTitle(lastSavedState.title); // Restaurar al valor guardado
                        setEditingTitle(false);
                      }
                    }}
                    className="text-2xl font-light bg-transparent focus:outline-none text-gray-700 dark:text-gray-300 w-full mb-6"
                    placeholder="Image title"
                    autoFocus
                    spellCheck="false"
                  />
                ) : (
                  <motion.h2 
                    className={`text-xl sm:text-2xl font-light text-gray-700 dark:text-gray-300 ${!isLiveMode ? 'cursor-pointer' : ''} group mb-4 sm:mb-6`}
                    onClick={() => {
                      if (!isLiveMode) {
                        setEditingTitle(true);
                        // Dar tiempo al DOM para que se actualice antes de enfocar
                        setTimeout(() => {
                          titleInputRef.current?.focus();
                        }, 50);
                      }
                    }}
                    whileHover={!isLiveMode ? { x: 2, color: '#3B82F6' } : undefined}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {title || (isLiveMode ? "" : "Click to add a title")}
                    {!isLiveMode && <span className="inline-block w-0 group-hover:w-full h-[1px] bg-gray-400/30 dark:bg-gray-500/30 mt-1 transition-all duration-300"></span>}
                  </motion.h2>
                )}

                {/* Editor de texto enriquecido */}
                <div className="flex-grow min-h-[150px] sm:min-h-[200px] h-full">
                  {!isLiveMode && <MenuBar editor={editor} />}
                  <EditorContent 
                    editor={editor} 
                    className={`prose prose-sm dark:prose-invert max-w-none h-full overflow-auto ${!isLiveMode ? 'focus:outline-none' : ''} text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500`}
                    spellCheck="false"
                  />
                  {/* Verificamos si es string vacío o HTML con tags vacíos como <p></p> */}
                  {(!description || description === '<p></p>' || description === '<p>&nbsp;</p>') && !isLiveMode && (
                    <motion.div 
                      className="text-gray-400 dark:text-gray-500 italic text-sm mt-2 pointer-events-none absolute top-[9.5rem] left-5 sm:left-7 md:left-9"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      Write here to add a description...
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Image section (right side) - Ahora como una tarjeta independiente */}
            <div className="md:w-1/2 p-0 relative overflow-visible">
              <motion.div
                className="bg-white/90 dark:bg-gray-900/95 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="relative p-4 sm:p-5 flex flex-col">
                  {/* Contenedor de imagen con altura fija */}
                  <div className="relative flex items-center justify-center mb-3 group">
                    <Image
                      src={imageUrl}
                      alt={title || "Selected image"}
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 75vw, 50vw"
                      className="rounded-lg max-w-full max-h-[50vh] sm:max-h-[55vh] md:max-h-[65vh] h-auto w-auto object-contain"
                      style={{ objectFit: 'contain' }}
                      priority
                      unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
                    />
                    
                    {/* Overlay de etiquetas sutilmente visible sobre la imagen */}
                    {tags.length > 0 && (
                      <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-lg">
                        <ImageTags tags={tags} isLiveMode={isLiveMode} />
                      </div>
                    )}
                  </div>
                  
                  {/* Editor de etiquetas - Visible en móviles o en hover en desktop */}
                  <AnimatePresence>
                    {(isMobile || isHovering) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="py-1 border-t border-gray-100 dark:border-gray-800 mt-1">
                          <ImageTagsEditor 
                            tags={tags} 
                            onTagsChange={setTags} 
                            isLiveMode={isLiveMode} 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageDetailPopup;
