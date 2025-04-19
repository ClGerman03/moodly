"use client";

import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SidePanelProps {
  /**
   * Controla si el panel lateral está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Función que se ejecuta cuando se cierra el panel
   */
  onClose: () => void;
  
  /**
   * Título del panel (opcional)
   */
  title?: string;
  
  /**
   * Contenido del panel
   */
  children: React.ReactNode;
  
  /**
   * Ancho del panel en píxeles (por defecto 450px)
   */
  width?: number;
  
  /**
   * Si es true, se muestra una capa semitransparente detrás del panel
   */
  showBackdrop?: boolean;
  
  /**
   * Posición del panel (derecha o izquierda)
   */
  position?: 'right' | 'left';
}

/**
 * Componente reutilizable para mostrar un panel lateral deslizante
 * Puede utilizarse para diferentes tipos de contenido que requieran
 * un panel lateral que aparezca desde los bordes de la pantalla
 */
const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 450,
  showBackdrop = true,
  position = 'right'
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Manejar clic fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Manejar tecla escape para cerrar
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  // Determinar desde qué dirección debe animarse el panel
  const animationProps = {
    initial: { 
      x: position === 'right' ? width + 30 : -(width + 30), 
      opacity: 0 
    },
    animate: { 
      x: 0, 
      opacity: 1 
    },
    exit: { 
      x: position === 'right' ? width + 30 : -(width + 30), 
      opacity: 0 
    },
    transition: { 
      type: "spring", 
      damping: 26, 
      stiffness: 340,
      mass: 1.2
    }
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-2">
          {/* Backdrop semitransparente */}
          {showBackdrop && (
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Contenedor lateral */}
          <motion.div
            ref={panelRef}
            className={`relative z-10 h-[95vh] flex flex-col bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800`}
            style={{ 
              width: `${width}px`, 
              maxWidth: '100%',
              marginLeft: position === 'right' ? 'auto' : '0',
              marginRight: position === 'left' ? 'auto' : '0'
            }}
            {...animationProps}
          >
            {/* Botón cerrar en la esquina superior derecha */}
            <motion.button
              className="absolute top-5 right-5 bg-black/70 text-white p-2 rounded-full z-20
                         hover:bg-black/80 transition-colors shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </motion.button>

            {/* Contenido del panel */}
            <div className="flex flex-col h-full p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Título del panel si existe */}
              {title && (
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {title}
                </h3>
              )}

              {/* Contenido principal */}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
