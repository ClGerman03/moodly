"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LucideCheck, LucideX, LucideUsers, LucideSend } from "lucide-react";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string;
}

/**
 * Componente para compartir el tablero mediante una URL personalizada o invitando usuarios
 */
const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  boardId = "mi-tablero"
}) => {
  // Estado para la URL personalizada
  const [customUrlSegment, setCustomUrlSegment] = useState(boardId);
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  
  // Estado para compartir con usuarios
  const [userEmail, setUserEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [historyStateAdded, setHistoryStateAdded] = useState(false);
  
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
  
  // Validar formato de email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Publicar tablero con URL personalizada
  const handlePublish = () => {
    setIsPublished(true);
    setShowUrlSuccess(true);
    
    // Ocultar el mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setShowUrlSuccess(false);
    }, 3000);
  };
  
  // Añadir usuario a la lista de compartidos
  const handleAddUser = () => {
    if (userEmail && !sharedUsers.includes(userEmail)) {
      setSharedUsers([...sharedUsers, userEmail]);
      setUserEmail("");
    }
  };
  
  // Eliminar usuario de la lista de compartidos
  const handleRemoveUser = (userToRemove: string) => {
    setSharedUsers(sharedUsers.filter(user => user !== userToRemove));
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
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          
          {/* Popup Container */}
          <motion.div
            ref={popupRef}
            className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 p-4">
              <h2 className="text-xl font-light text-gray-800 dark:text-gray-200">Compartir tablero</h2>
              <button 
                onClick={() => {
                  // Si añadimos una entrada al historial para este popup, volvemos atrás para que no se acumulen
                  if (historyStateAdded && typeof window !== 'undefined') {
                    setHistoryStateAdded(false);
                    window.history.back();
                  }
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <LucideX size={18} strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              {/* Sección de URL personalizada */}
              <div className="mb-6">
                <div className="flex flex-col mb-2">
                  <label htmlFor="custom-url" className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    Personaliza la URL de tu tablero
                  </label>
                  <div className="flex items-center">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-l-md text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      www.moodly.com/
                    </div>
                    <input
                      id="custom-url"
                      type="text"
                      value={customUrlSegment}
                      onChange={(e) => setCustomUrlSegment(e.target.value.trim().replace(/\s+/g, '-'))}
                      className="flex-1 px-3 py-2 text-sm border-0 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-r-md focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700"
                      placeholder="mi-tablero"
                    />
                  </div>
                  
                  {showUrlSuccess && (
                    <motion.div 
                      className="flex items-center mt-2 text-green-600 dark:text-green-400 text-xs"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <LucideCheck size={14} className="mr-1" /> URL publicada correctamente
                    </motion.div>
                  )}
                </div>
                
                <button
                  onClick={handlePublish}
                  disabled={!customUrlSegment || customUrlSegment.length < 3}
                  className={`mt-2 w-full py-2 px-4 rounded-md transition-colors ${
                    isPublished
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  }`}
                >
                  {isPublished ? "Publicado" : "Publicar"}
                </button>
              </div>
              
              {/* Separador */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-100 dark:bg-gray-800"></div>
                <span className="mx-3 text-xs text-gray-400 dark:text-gray-500">o</span>
                <div className="flex-grow h-px bg-gray-100 dark:bg-gray-800"></div>
              </div>
              
              {/* Sección de compartir con usuarios */}
              <div>
                <div className="flex flex-col mb-2">
                  <label htmlFor="user-email" className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center">
                    <LucideUsers size={14} className="mr-1.5" /> Compartir con otras personas
                  </label>
                  <div className="flex">
                    <input
                      id="user-email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-l-md border-0 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700"
                      placeholder="Correo o nombre de usuario"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidEmail(userEmail)) {
                          handleAddUser();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddUser}
                      disabled={!isValidEmail(userEmail)}
                      className={`px-3 py-2 rounded-r-md transition-colors ${
                        isValidEmail(userEmail)
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <LucideSend size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Lista de usuarios compartidos */}
                <div className="mt-3">
                  {sharedUsers.length > 0 ? (
                    <ul className="space-y-1.5">
                      {sharedUsers.map((user, index) => (
                        <motion.li
                          key={user}
                          className="flex items-center justify-between py-1.5 px-3 rounded-md bg-gray-50 dark:bg-gray-800/50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{user}</span>
                          <button
                            onClick={() => handleRemoveUser(user)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <LucideX size={14} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center py-3 text-xs text-gray-400 dark:text-gray-500">
                      No has compartido este tablero con nadie
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 text-center">
              Los usuarios con acceso podrán ver pero no editar el tablero
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharePopup;
