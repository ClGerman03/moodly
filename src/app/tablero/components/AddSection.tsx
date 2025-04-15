"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionType } from "../types";

// Usando el tipo compartido SectionType importado

interface AddSectionProps {
  onAddSection: (type: SectionType) => void;
}

// Definición de opciones de sección con iconos
interface SectionOption {
  type: SectionType;
  label: string;
  icon: string;
}

const AddSection = ({ onAddSection }: AddSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Opciones de sección con sus respectivos iconos
  const sectionOptions: SectionOption[] = [
    { 
      type: "imageGallery", 
      label: "Galería de Imágenes", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    },
    { 
      type: "bento", 
      label: "Bento Images", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    },
    { 
      type: "palette", 
      label: "Color Palette", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"></circle><circle cx="19" cy="13" r="2"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="10" cy="19" r="2"></circle><line x1="12" y1="22" x2="12" y2="12"></line></svg>`
    },
    { 
      type: "links", 
      label: "Enlaces", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
    },
    { 
      type: "typography", 
      label: "Tipografía", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`
    },
    { 
      type: "text", 
      label: "Texto", 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`
    }
  ];
  
  // Cerrar el menu cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          menuRef.current && 
          containerRef.current && 
          !menuRef.current.contains(event.target as Node) &&
          !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  const handleAddSection = (type: SectionType) => {
    onAddSection(type);
    setIsOpen(false);
  };

  return (
    <div className="my-6 w-full relative" ref={containerRef}>
      <motion.div 
        className="py-3 flex justify-center cursor-pointer"
        onClick={toggleOptions}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
      >
        <span className="text-xs font-light text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200">
          + Agregar sección
        </span>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            ref={menuRef}
            className="absolute left-0 right-0 z-10 mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg py-2 px-0 mt-1 w-full max-w-xs"
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Vista vertical para todos los dispositivos */}
            <div className="space-y-2">
              {sectionOptions.map((option) => (
                <motion.div 
                  key={option.type}
                  className="py-2 px-3 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-150 flex items-center gap-3 rounded-md"
                  onClick={() => handleAddSection(option.type)}
                  whileHover={{ x: 2 }}
                >
                  <div className="text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: option.icon }} />
                  <span>{option.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddSection;
