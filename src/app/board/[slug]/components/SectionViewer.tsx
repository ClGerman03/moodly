"use client";

import { motion } from "framer-motion";
import { Section } from "@/app/tablero/types";

// Importar componentes específicos de feedback
import BentoImageFeedback from "./feedback/BentoImageFeedback";
import ColorPaletteFeedback from "./feedback/ColorPaletteFeedback";
import LinkSectionFeedback from "./feedback/LinkSectionFeedback";
import TypographyFeedback from "./feedback/TypographyFeedback";
import TextSectionFeedback from "./feedback/TextSectionFeedback";

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
        {section.description && (
          <p className="text-sm font-light text-gray-500 mb-2">
            {section.description}
          </p>
        )}
      </div>
      
      {/* Contenedor para la sección */}
      <div className="bg-white rounded-lg">
        {/* Usar componente específico según el tipo de sección */}
        {section.type === "imageGallery" ? (
          <BentoImageFeedback 
            section={section}
            onFeedback={onFeedback}
          />
        ) : section.type === "palette" ? (
          <ColorPaletteFeedback
            section={section}
            onFeedback={onFeedback}
          />
        ) : section.type === "links" ? (
          <LinkSectionFeedback
            section={section}
            onFeedback={onFeedback}
          />
        ) : section.type === "typography" ? (
          <TypographyFeedback
            section={section}
            onFeedback={onFeedback}
          />
        ) : section.type === "text" ? (
          <TextSectionFeedback
            section={section}
            onFeedback={onFeedback}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Tipo de sección no soportada
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SectionViewer;
