"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Section, PreviewSize } from "@/app/tablero/types";
import FontDetailPopup from "../popups/FontDetailPopup";
import { useSectionFeedback } from "../hooks/useSectionFeedback";

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

interface TypographyFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente presentacional para mostrar una fuente
 */
interface FontCardProps {
  font: FontOption;
  previewText: string;
  hasUserFeedback: boolean;
  feedbackType?: 'positive' | 'negative';
  onClick: () => void;
}

const FontCard: React.FC<FontCardProps> = ({
  font,
  previewText,
  hasUserFeedback,
  feedbackType,
  onClick
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-lg p-4 transition-all cursor-pointer bg-white dark:bg-gray-800/20 shadow-sm hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
            {font.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            {font.category} · {font.weights.length} {font.weights.length === 1 ? "peso" : "pesos"}
          </p>
        </div>
        
        {hasUserFeedback && (
          <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
            feedbackType === 'positive' 
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
          }`}>
            {feedbackType === 'positive' 
              ? <ThumbsUp size={14} /> 
              : <ThumbsDown size={14} />
            }
          </div>
        )}
      </div>

      {/* Font preview - versión minimalista */}
      <div 
        style={{ fontFamily: font.family }} 
        className="mt-4 mb-3 overflow-hidden"
      >
        <div 
          style={{ fontWeight: font.weights[0] || 700 }} 
          className="text-3xl text-gray-800 dark:text-gray-200 truncate"
        >
          Aa
        </div>
        <div 
          style={{ fontWeight: font.weights.includes(400) ? 400 : font.weights[0] || 300 }} 
          className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
        >
          {previewText}
        </div>
      </div>

      {/* Botón para ver más */}
      <div className="flex justify-end mt-2">
        <button
          className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver detalles <ExternalLink size={12} />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Componente principal que conecta la presentación con la lógica de feedback
 */
const TypographyFeedback: React.FC<TypographyFeedbackProps> = ({
  section,
  onFeedback
}) => {
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // Utilizar el hook común para gestión de feedback
  const {
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });

  const fonts = section.data?.fonts as FontOption[] || [];
  // Obtener el tamaño configurado en el panel o usar "md" como valor predeterminado
  const previewSize = (section.data?.previewSize as PreviewSize) || "md";
  // Obtener el texto de ejemplo configurado o usar un valor predeterminado
  const previewText = section.data?.previewText || "La tipografía es el arte y técnica de elegir y usar tipos.";

  const selectedFont = fonts.find(font => font.id === selectedFontId) || null;

  // Handler para manejar el feedback positivo/negativo
  const handleFontFeedback = (fontId: string, type: 'positive' | 'negative' | 'comment') => {
    if (type === 'comment') {
      setSelectedFontId(fontId);
      setIsPopupOpen(true);
      return;
    }
    
    handleItemFeedback(fontId, type);
  };

  // Handler para abrir el popup de detalles
  const handleOpenPopup = (fontId: string) => {
    setSelectedFontId(fontId);
    setIsPopupOpen(true);
  };

  // Handler para cerrar el popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    cancelComment();
  };

  // Handler para manejar comentarios
  const handleFontCommentSubmit = (comment: string) => {
    if (!selectedFontId || !comment.trim()) return;
    
    setCurrentComment(comment);
    handleSubmitComment();
    setIsPopupOpen(false);
  };

  if (!fonts.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene tipografías
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {fonts.map((font) => (
          <FontCard
            key={font.id}
            font={font}
            previewText={previewText}
            hasUserFeedback={!!getItemFeedback(font.id)}
            feedbackType={getItemFeedback(font.id) as 'positive' | 'negative'}
            onClick={() => handleOpenPopup(font.id)}
          />
        ))}
      </div>

      {/* Font Detail Popup */}
      <FontDetailPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        font={selectedFont}
        previewSize={previewSize}
        previewText={previewText}
        onLike={() => selectedFontId && handleFontFeedback(selectedFontId, 'positive')}
        onDislike={() => selectedFontId && handleFontFeedback(selectedFontId, 'negative')}
        onSubmitComment={handleFontCommentSubmit}
        userFeedback={selectedFontId ? getItemFeedback(selectedFontId) as 'positive' | 'negative' | null : null}
      />
    </div>
  );
};

export default TypographyFeedback;
