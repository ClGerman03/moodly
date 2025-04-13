"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionType } from "../types";

// Usando el tipo compartido SectionType importado

interface AddSectionProps {
  onAddSection: (type: SectionType) => void;
  existingTypes: SectionType[];
}

const AddSection = ({ onAddSection }: AddSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
            className="absolute left-0 right-0 z-10 mx-auto max-w-xs bg-white dark:bg-gray-900 rounded-lg shadow-lg py-2 mt-1"
            style={{ 
              maxWidth: containerRef.current ? Math.min(300, containerRef.current.offsetWidth) : 300,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <motion.div 
              className="py-2 px-4 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-150"
              onClick={() => handleAddSection("bento")}
              whileHover={{ x: 2 }}
            >
              Bento Images
            </motion.div>
            
            <motion.div 
              className="py-2 px-4 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-150"
              onClick={() => handleAddSection("palette")}
              whileHover={{ x: 2 }}
            >
              Color Palette
            </motion.div>

            <motion.div 
              className="py-2 px-4 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-150"
              onClick={() => handleAddSection("links")}
              whileHover={{ x: 2 }}
            >
              Enlaces
            </motion.div>
            
            <motion.div 
              className="py-2 px-4 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-150"
              onClick={() => handleAddSection("typography")}
              whileHover={{ x: 2 }}
            >
              Tipografía
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddSection;
