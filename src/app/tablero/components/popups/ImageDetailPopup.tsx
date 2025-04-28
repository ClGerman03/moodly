"use client";

import React, { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageTagsEditor from "./ImageTagsEditor";
import ImageTags from "./ImageTags";
import { useMediaQuery } from "@/app/tablero/hooks/useMediaQuery";
import { useBackButtonHandler } from "@/hooks/useBackButtonHandler";

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
  // Estados simplificados
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [editingTitle, setEditingTitle] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Detectar si es un dispositivo móvil
  const isMobile = useMediaQuery("(max-width: 768px)");
  const popupRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Usar el hook personalizado para manejar el botón atrás en dispositivos móviles
  useBackButtonHandler(isOpen, onClose);
  
  // Configuración del editor de texto enriquecido - simplificada
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialDescription,
    editable: !isLiveMode, // Asegurar que el editor sea editable si no estamos en modo live
    immediatelyRender: false, // Evitar problemas de hidratación en SSR
    onCreate: ({ editor }) => {
      // Asegurarse de que el contenido inicial se carga correctamente
      if (initialDescription) {
        editor.commands.setContent(initialDescription);
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setDescription(html);
      setHasChanges(true);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] py-2 h-full',
      },
    },
  });

  // Inicializar valores cuando se abre el popup
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "");
      setDescription(initialDescription || "");
      setTags(initialTags || []);
      setHasChanges(false);
      
      // Actualizar el contenido del editor si está disponible
      if (editor && editor.commands) {
        // Usar un pequeño timeout para evitar problemas de renderizado
        setTimeout(() => {
          editor.commands.setContent(initialDescription || '');
        }, 10);
      }
      
      // Auto-focus en el título solo si está vacío
      if (!initialTitle) {
        setTimeout(() => {
          setEditingTitle(true);
          titleInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, initialTitle, initialDescription, initialTags, editor]);

  // Marcar cambios cuando el título o tags se modifican
  useEffect(() => {
    if (isOpen && (title !== initialTitle || JSON.stringify(tags) !== JSON.stringify(initialTags))) {
      setHasChanges(true);
    }
  }, [title, tags, initialTitle, initialTags, isOpen]);

  // Función para guardar cambios
  const handleSaveChanges = () => {
    onSave(title, description, tags);
    setHasChanges(false);
    // Opcional: mostrar un mensaje de éxito
  };

  // Función para cerrar el popup sin guardar cambios
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Función para detectar clics fuera del popup
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      handleClose();
    }
  }, [handleClose, popupRef]);

  // Función para detectar la tecla Escape
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  }, [handleClose]);

  // Handle click outside to close
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, hasChanges, handleClickOutside, handleEscKey]);

  // Manejar cambios en el título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setHasChanges(true);
  };

  // Manejar cuando se termina de editar el título
  const handleTitleBlur = () => {
    // Solo cambiar el estado de edición, sin guardar automáticamente
    setEditingTitle(false);
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />

          {/* Main popup container */}
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
            {/* Content section (left side) */}
            <div className="md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col h-full overflow-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
              
              {/* Header con solo botón de guardado */}
              <div className="flex justify-end mb-4">
                {/* Botón de guardado negro */}
                {!isLiveMode && (
                  <button 
                    onClick={handleSaveChanges}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-md flex items-center ${
                      hasChanges 
                        ? "text-white bg-gray-800 hover:bg-gray-700 shadow-sm" 
                        : "text-gray-200 bg-gray-800 dark:text-gray-300 dark:bg-gray-800"
                    }`}
                  >
                    {hasChanges ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-col flex-grow mt-6">
                {/* Editable Title */}
                {!isLiveMode && editingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        handleTitleBlur();
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
                        setTimeout(() => titleInputRef.current?.focus(), 50);
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
                  {/* Placeholder cuando no hay descripción - posición corregida */}
                  {(!description || description === '<p></p>' || description === '<p>&nbsp;</p>') && !isLiveMode && (
                    <motion.div 
                      className="text-gray-400 dark:text-gray-500 italic text-sm mt-2 pointer-events-none absolute top-[12rem] left-5 sm:left-7 md:left-9"
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

            {/* Image section (right side) */}
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
                      width={500} // Usar dimensiones fijas para mejorar la estabilidad
                      height={300}
                      sizes="(max-width: 768px) 75vw, 50vw"
                      className="rounded-lg max-w-full max-h-[50vh] sm:max-h-[55vh] md:max-h-[65vh] h-auto w-auto object-contain"
                      style={{ objectFit: 'contain' }}
                      priority={true}
                      unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
                      loading="eager"
                      onError={() => console.log("Error loading image")}
                    />
                    
                    {/* Overlay de etiquetas sutilmente visible sobre la imagen */}
                    {tags.length > 0 && (
                      <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-lg">
                        <ImageTags tags={tags} />
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
