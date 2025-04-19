"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/app/tablero/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { normalizeFeedback } from "./feedback/adapters/feedbackNormalizer";

// Importar componentes especializados para cada tipo de resumen
import ImageGallerySummary from "./feedback/summary/ImageGallerySummary";
import ColorPaletteSummary from "./feedback/summary/ColorPaletteSummary";
import TypographySummary from "./feedback/summary/TypographySummary";
import TextSummary from "./feedback/summary/TextSummary";
import LinksSummary from "./feedback/summary/LinksSummary";

interface FeedbackSummaryProps {
  sections: Section[];
  feedback: Record<string, Record<string, unknown>>;
  onFinish: () => void;
  clientName: string;
}

/**
 * Componente que muestra un resumen del feedback proporcionado por el usuario
 * para todas las secciones del tablero
 */
const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  sections,
  feedback,
  onFinish,
  clientName
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Función para expandir/colapsar secciones
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Determinar si una sección tiene feedback
  const hasFeedback = (sectionId: string): boolean => {
    return !!feedback[sectionId] && Object.keys(feedback[sectionId]).length > 0;
  };
  
  // Renderizar el feedback para una sección específica
  const renderSectionFeedback = (section: Section) => {
    const sectionFeedback = feedback[section.id] || {};
    const isExpanded = expandedSections[section.id] || false;
    
    return (
      <motion.div 
        key={section.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center">
            <h3 className="text-lg font-light text-gray-800 dark:text-gray-200">
              {section.title}
            </h3>
          </div>
          <div className="flex items-center">
            {hasFeedback(section.id) && (
              <span className="text-xs font-light text-gray-500 dark:text-gray-400 mr-2">
                {Object.keys(sectionFeedback).length} respuestas
              </span>
            )}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4"
            >
              {hasFeedback(section.id) ? (
                <div className="pt-2">
                  {/* Usar los componentes especializados basados en el tipo de sección */}
                  {renderSectionContent(section, sectionFeedback)}
                </div>
              ) : (
                <div className="py-3 text-center text-gray-500 dark:text-gray-400 italic text-sm">
                  No comments
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Renderizar el contenido específico basado en el tipo de sección
  const renderSectionContent = (section: Section, sectionFeedback: Record<string, unknown>) => {
    // Normalizar el feedback para este tipo de sección
    const normalizedFeedback = normalizeFeedback(section.type, sectionFeedback);
    
    // Renderizar el componente apropiado según el tipo
    switch (section.type) {
      case "imageGallery":
        return <ImageGallerySummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "palette":
        return <ColorPaletteSummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "typography":
        return <TypographySummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "text":
        return <TextSummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "links":
        return <LinksSummary section={section} normalizedFeedback={normalizedFeedback} />;
      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Feedback no disponible para este tipo de sección
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
          Resumen de feedback
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {clientName ? `Feedback proporcionado por ${clientName}` : 'Feedback anónimo'}
        </p>
      </div>
      
      <div className="space-y-4">
        {sections.map(renderSectionFeedback)}
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={onFinish}
          className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default FeedbackSummary;
