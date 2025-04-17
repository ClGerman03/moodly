"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Section, PreviewSize } from "@/app/tablero/types";
import FontDetailPopup from "../popups/FontDetailPopup";

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

// Mapeo de tamaños para diferentes elementos tipográficos
// Actualmente no se utiliza pero se mantiene comentado para referencia futura
/*
const fontSizeMappings: Record<PreviewSize, { heading: string; subheading: string; body: string }> = {
  sm: {
    heading: "text-xl md:text-2xl",
    subheading: "text-lg",
    body: "text-sm"
  },
  md: {
    heading: "text-2xl md:text-3xl",
    subheading: "text-xl",
    body: "text-base"
  },
  lg: {
    heading: "text-3xl md:text-4xl",
    subheading: "text-2xl",
    body: "text-lg"
  }
};
*/

const TypographyFeedback: React.FC<TypographyFeedbackProps> = ({
  section,
  onFeedback
}) => {
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  // Variables no utilizadas:
  // const [comment, setComment] = useState<string>("");
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const fonts = section.data?.fonts as FontOption[] || [];
  // Obtener el tamaño configurado en el panel o usar "md" como valor predeterminado
  const previewSize = (section.data?.previewSize as PreviewSize) || "md";
  // Obtener el texto de ejemplo configurado o usar un valor predeterminado
  const previewText = section.data?.previewText || "La tipografía es el arte y técnica de elegir y usar tipos.";

  const selectedFont = fonts.find(font => font.id === selectedFontId) || null;

  const handleFeedback = (fontId: string, type: 'positive' | 'negative') => {
    setUserFeedback(prev => ({
      ...prev,
      [fontId]: type
    }));

    onFeedback?.(section.id, {
      fontFeedback: {
        ...userFeedback,
        [fontId]: type
      }
    });
  };

  const handleSubmitComment = (comment: string) => {
    if (!selectedFontId || !comment.trim()) return;

    onFeedback?.(section.id, {
      fontComments: {
        [selectedFontId]: comment.trim()
      }
    });
  };

  const handleOpenPopup = (fontId: string) => {
    setSelectedFontId(fontId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
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
          <motion.div
            key={font.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-lg p-4 transition-all cursor-pointer bg-white dark:bg-gray-800/20 shadow-sm hover:shadow-md`}
            onClick={() => handleOpenPopup(font.id)}
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
              
              {userFeedback[font.id] && (
                <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
                  userFeedback[font.id] === 'positive' 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                }`}>
                  {userFeedback[font.id] === 'positive' 
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
                  handleOpenPopup(font.id);
                }}
              >
                Ver detalles <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Font Detail Popup */}
      <FontDetailPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        font={selectedFont}
        previewSize={previewSize}
        previewText={previewText}
        onLike={() => selectedFontId && handleFeedback(selectedFontId, 'positive')}
        onDislike={() => selectedFontId && handleFeedback(selectedFontId, 'negative')}
        onSubmitComment={handleSubmitComment}
        userFeedback={selectedFontId ? userFeedback[selectedFontId] : null}
      />
    </div>
  );
};

export default TypographyFeedback;
