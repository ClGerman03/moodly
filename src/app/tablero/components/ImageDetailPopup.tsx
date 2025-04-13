"use client";

import React, { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ImageDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialDescription?: string;
  onSave: (title: string, description: string) => void;
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
  onSave,
  isLiveMode = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [editingTitle, setEditingTitle] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Configuración del editor de texto enriquecido
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialDescription,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setDescription(html);
      
      // Autoguardado mientras escribe
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSave(title, html);
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[200px] py-2 h-full',
      },
    },
  });

  // Manejar cambios en el estado del popup o la imagen
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLiveMode);
    }
  }, [editor, isLiveMode]);

  useEffect(() => {
    // Solo ejecutar cuando el popup está abierto
    if (!isOpen) return;
    
    // Resetear los valores con los específicos de la imagen actual
    setTitle(initialTitle);
    
    // Actualizar el contenido del editor si está disponible
    if (editor && editor.commands) {
      editor.commands.setContent(initialDescription || '');
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
    
  }, [isOpen, imageUrl, initialTitle, initialDescription, editor]); // dependencias necesarias

  // Memoizamos handleClose para evitar recreaciones innecesarias
  const handleClose = useCallback(() => {
    // Save data before closing if there are changes
    if (title !== initialTitle || description !== initialDescription) {
      onSave(title, description);
    }
    onClose();
  }, [title, description, initialTitle, initialDescription, onSave, onClose]);

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

  // Referencias para evitar bucles infinitos
  const prevImageUrlRef = useRef<string>(imageUrl);
  
  // Auto-save cuando el componente se desmonta o cuando cambia la imagen
  useEffect(() => {
    // Función para guardar los cambios pendientes
    const saveChanges = () => {
      if (title !== initialTitle || description !== initialDescription) {
        onSave(title, description);
      }
    };
    
    // Solo guardar cuando cambia la imagen, no en cada renderizado
    if (isOpen && prevImageUrlRef.current !== imageUrl && prevImageUrlRef.current !== '') {
      saveChanges();
    }
    
    // Actualizar la referencia para la próxima vez
    prevImageUrlRef.current = imageUrl;
    
    // Cleanup cuando se desmonta el componente
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveChanges();
      }
    };
    // Nota: Intencionalmente omitimos algunas dependencias para evitar efectos secundarios
    // Esto es un patrón común en casos donde solo queremos responder a cambios específicos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, title, description, initialTitle, initialDescription, onSave, isOpen]);

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop sin blur */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Main popup container */}
          <motion.div
            ref={popupRef}
            className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col md:flex-row max-w-5xl w-[95%] max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Content section (left side) */}
            <div className="md:w-1/2 p-8 pb-4 flex flex-col h-full overflow-auto">

              <div className="flex flex-col flex-grow mt-6">
                {/* Editable Title - Estilo similar a SectionManager */}
                {!isLiveMode && editingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      setEditingTitle(false);
                      if (title !== initialTitle) {
                        onSave(title, description);
                      }
                    }}
                    onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        setEditingTitle(false);
                        if (title !== initialTitle) {
                          onSave(title, description);
                        }
                      } else if (e.key === 'Escape') {
                        setTitle(initialTitle);
                        setEditingTitle(false);
                      }
                    }}
                    className="text-2xl font-light bg-transparent focus:outline-none text-gray-700 dark:text-gray-300 w-full mb-6"
                    placeholder="Título de la imagen"
                    autoFocus
                  />
                ) : (
                  <motion.h2 
                    className={`text-2xl font-light text-gray-700 dark:text-gray-300 ${!isLiveMode ? 'cursor-pointer' : ''} group mb-6`}
                    onClick={() => !isLiveMode && setEditingTitle(true)}
                    whileHover={!isLiveMode ? { x: 2 } : undefined}
                  >
                    {title || (isLiveMode ? "" : "Haz clic para añadir un título")}
                    {!isLiveMode && <span className="inline-block w-0 group-hover:w-full h-[1px] bg-gray-400/30 dark:bg-gray-500/30 mt-1 transition-all duration-300"></span>}
                  </motion.h2>
                )}

                {/* Editor de texto enriquecido */}
                <div className="flex-grow min-h-[200px] h-full">
                  {!isLiveMode && <MenuBar editor={editor} />}
                  <EditorContent 
                    editor={editor} 
                    className={`prose prose-sm dark:prose-invert max-w-none h-full overflow-auto ${!isLiveMode ? 'focus:outline-none' : ''} text-gray-700 dark:text-gray-300`}
                  />
                </div>
              </div>
            </div>

            {/* Image section (right side) */}
            <div className="md:w-1/2 p-4 relative flex items-center justify-center overflow-hidden">
              <div className="relative w-[90%] h-[90%] rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={imageUrl}
                  alt={title || "Imagen seleccionada"}
                  fill
                  sizes="(max-width: 768px) 95vw, 50vw"
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageDetailPopup;
