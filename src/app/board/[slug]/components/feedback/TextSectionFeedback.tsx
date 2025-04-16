"use client";

import { motion } from "framer-motion";
import { Section, TextContent, TextSize } from "@/app/tablero/types";

interface TextSectionFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente para mostrar la sección de texto en la vista pública del tablero
 * Permite visualizar el título y subtítulo con el tamaño configurado
 */
const TextSectionFeedback: React.FC<TextSectionFeedbackProps> = ({
  section,
  // onFeedback no se utiliza actualmente pero se mantiene en la interfaz
  // para mantener consistencia con otros componentes de feedback
}) => {
  // Extraer el contenido de texto de la sección
  const textContent = section.data?.textContent as TextContent | undefined;
  
  // Si no hay contenido de texto, mostrar un mensaje
  if (!textContent) {
    return (
      <div className="py-8 text-center text-gray-500">
        Esta sección no contiene texto
      </div>
    );
  }

  // Determinar las clases de tamaño según la configuración
  const getTitleClass = (size: TextSize) => {
    switch (size) {
      case "small":
        return "text-xl md:text-2xl font-light";
      case "large":
        return "text-3xl md:text-4xl font-light";
      case "medium":
      default:
        return "text-2xl md:text-3xl font-light";
    }
  };

  const getSubtitleClass = (size: TextSize) => {
    switch (size) {
      case "small":
        return "text-sm md:text-base font-light";
      case "large":
        return "text-lg md:text-xl font-light";
      case "medium":
      default:
        return "text-base md:text-lg font-light";
    }
  };

  return (
    <motion.div 
      className="p-6 md:p-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto">
        {textContent.title && (
          <motion.h2 
            className={`${getTitleClass(textContent.size)} text-gray-800 dark:text-gray-100 mb-3`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {textContent.title}
          </motion.h2>
        )}
        
        {textContent.subtitle && (
          <motion.p 
            className={`${getSubtitleClass(textContent.size)} text-gray-600 dark:text-gray-400`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {textContent.subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default TextSectionFeedback;
