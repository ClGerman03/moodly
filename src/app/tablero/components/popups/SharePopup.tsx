"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/app/tablero/types";
import { useBoardPublication } from "@/app/tablero/hooks/useBoardPublication";
import { PublishForm } from "./PublishForm";

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
  const [historyStateAdded, setHistoryStateAdded] = useState(false);
  
  // Referencias para detectar clics fuera del popup
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Usar el hook de publicación 
  const {
    customUrlSegment,
    setCustomUrlSegment,
    boardLink,
    showAuthPrompt,
    publishingError,
    isPublishing,
    isPublished,
    publish,
    reset
  } = useBoardPublication({
    boardName,
    boardId,
    currentSections,
    onPublishSuccess: onPublish
  });
  
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
  
  // Limpiar recursos al cerrar
  useEffect(() => {
    if (!isOpen) {
      // Resetear estados si el popup se cierra y la publicación no se ha completado
      if (!isPublished && isPublishing) {
        reset();
      }
    }
  }, [isOpen, isPublished, isPublishing, reset]);

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
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="px-4 py-4">
              <PublishForm
                customUrlSegment={customUrlSegment}
                setCustomUrlSegment={setCustomUrlSegment}
                boardLink={boardLink}
                showAuthPrompt={showAuthPrompt}
                publishingError={publishingError}
                isPublishing={isPublishing}
                isPublished={isPublished}
                onPublish={publish}
              />
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
