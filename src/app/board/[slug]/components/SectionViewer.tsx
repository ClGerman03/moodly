"use client";

import { motion } from "framer-motion";
import SectionManager from "@/app/tablero/components/SectionManager";
import { Section } from "@/app/tablero/types";

// Importar componentes específicos de feedback
import BentoImageFeedback from "./feedback/BentoImageFeedback";

interface SectionViewerProps {
  section: Section;
  onFeedback: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente que muestra una sección individual del tablero
 * En el futuro, este componente se extenderá para incluir interacciones específicas
 * para cada tipo de sección (selección de imágenes, votación de paletas, etc.)
 */
const SectionViewer: React.FC<SectionViewerProps> = ({ 
  section, 
  onFeedback
}) => {
  return (
    <motion.div 
      className="max-w-6xl mx-auto px-4 pt-2 pb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-3">
        <h2 className="text-xl font-light text-gray-700 mb-1">
          {section.title}
        </h2>
      </div>
      
      {/* Contenedor para la sección */}
      <div className="bg-white rounded-lg">
        {/* Usar componente específico según el tipo de sección */}
        {section.type === "bento" ? (
          <BentoImageFeedback 
            section={section}
            onFeedback={onFeedback}
          />
        ) : (
          // Para otros tipos de secciones, seguimos usando el SectionManager por ahora
          <SectionManager
            fileInputRef={{ current: null }} // Placeholder, no se usa en modo live
            isLiveMode={true}
            initialSections={[section]}
          />
        )}
      </div>
      
      {/* En esta área se agregarán futuras interacciones específicas para cada tipo de sección */}
    </motion.div>
  );
};

export default SectionViewer;
