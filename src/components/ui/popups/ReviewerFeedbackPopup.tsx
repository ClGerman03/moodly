"use client";

import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { ReviewerFeedback } from '@/lib/feedbackService';
import { Section } from '@/app/tablero/types';

interface ReviewerFeedbackPopupProps {
  reviewer: ReviewerFeedback;
  sections?: Section[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Popup component for displaying detailed reviewer feedback
 */
const ReviewerFeedbackPopup: React.FC<ReviewerFeedbackPopupProps> = ({ 
  reviewer, 
  sections = [],
  isOpen, 
  onClose 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Reset expanded sections when popup opens with new reviewer
  useEffect(() => {
    if (isOpen) {
      setExpandedSections({});
    }
  }, [isOpen, reviewer.reviewerId]);
  
  // Función para alternar la expansión de una sección
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Función para obtener nombre de sección
  const getSectionName = (sectionId: string) => {
    // Intentar encontrar la sección correspondiente por su ID directo
    // Los IDs de sección en las respuestas son exactamente los mismos que los IDs de sección en el tablero
    if (sections && sections.length > 0) {
      // Primero intentamos encontrar una coincidencia exacta con el ID (caso más común)
      const matchedSection = sections.find(section => section.id === sectionId);
      if (matchedSection) {
        return matchedSection.title;
      }
      
      // Si no encontramos una coincidencia exacta, puede que sea un formato diferente
      // Los IDs a veces tienen el formato 'section-X' donde X es el índice
      const possibleIndex = parseInt(sectionId.split('-').pop() || '-1');
      if (possibleIndex >= 0 && possibleIndex < sections.length) {
        return sections[possibleIndex].title;
      }
    }
    
    // Si no podemos encontrar un nombre, usamos un valor predeterminado más descriptivo
    return `Section ${sectionId}`;
  };
  
  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // No mostramos nada si el popup no está abierto
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl font-light text-gray-700">{reviewer.reviewerName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-3">
              <h3 className="text-xl font-light text-gray-700">{reviewer.reviewerName}</h3>
              <p className="text-xs text-gray-500">Last feedback: {formatDate(reviewer.lastUpdated)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(reviewer.responses).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(reviewer.responses).map(([sectionId, sectionData]) => (
                <div key={sectionId} className="bg-white border-b border-gray-100 py-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(sectionId)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-lg font-light text-gray-700">
                          {getSectionName(sectionId).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="ml-3 text-sm font-medium text-gray-800">{getSectionName(sectionId)}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Indicadores de reacciones */}
                      {(sectionData.paletteFeedbacks?.some(f => f.type === 'positive') || 
                       Object.values(sectionData.feedbackItems || {}).some(item => item.reaction === 'positive')) && (
                        <div className="px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center">
                          <ThumbsUp size={12} className="text-gray-600 mr-1" />
                          <span className="text-gray-700">
                            {sectionData.paletteFeedbacks ? 
                              sectionData.paletteFeedbacks.filter(f => f.type === 'positive').length :
                              Object.values(sectionData.feedbackItems || {}).filter(item => item.reaction === 'positive').length
                            }
                          </span>
                        </div>
                      )}
                      
                      {(sectionData.paletteFeedbacks?.some(f => f.type === 'negative') || 
                       Object.values(sectionData.feedbackItems || {}).some(item => item.reaction === 'negative')) && (
                        <div className="px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center">
                          <ThumbsDown size={12} className="text-gray-600 mr-1" />
                          <span className="text-gray-700">
                            {sectionData.paletteFeedbacks ? 
                              sectionData.paletteFeedbacks.filter(f => f.type === 'negative').length :
                              Object.values(sectionData.feedbackItems || {}).filter(item => item.reaction === 'negative').length
                            }
                          </span>
                        </div>
                      )}
                      
                      {sectionData.comments && sectionData.comments.length > 0 && (
                        <div className="px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center">
                          <MessageSquare size={12} className="text-gray-600 mr-1" />
                          <span className="text-gray-700">{sectionData.comments.length}</span>
                        </div>
                      )}
                      
                      {/* Icono para expandir/colapsar */}
                      <div>
                        {expandedSections[sectionId] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenido expandible */}
                  {expandedSections[sectionId] && (
                    <div className="pl-10 mt-1 pt-2">
                      {sectionData.comments && sectionData.comments.length > 0 ? (
                        <div className="space-y-2">
                          {sectionData.comments.map((comment, index) => {
                            // Determinar qué tipo de reacción tiene este comentario
                            let reaction = 'neutral';
                            
                            // Primero verificamos en feedbackItems
                            if (sectionData.feedbackItems && sectionData.feedbackItems[comment.itemId]) {
                              reaction = sectionData.feedbackItems[comment.itemId].reaction;
                            } 
                            // Luego verificamos en paletteFeedbacks
                            else if (sectionData.paletteFeedbacks) {
                              const feedback = sectionData.paletteFeedbacks.find(f => f.paletteId === comment.itemId);
                              if (feedback) reaction = feedback.type;
                            }
                            // Por último en imageFeedback
                            else if (sectionData.imageFeedback && sectionData.imageFeedback[comment.itemId]) {
                              reaction = sectionData.imageFeedback[comment.itemId];
                            }
                            
                            return (
                              <div key={index} className="border-l-2 border-gray-100 pl-3 py-1">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    {reaction === 'positive' ? (
                                      <ThumbsUp size={12} className="text-gray-600 mt-1 mr-2" />
                                    ) : reaction === 'negative' ? (
                                      <ThumbsDown size={12} className="text-gray-600 mt-1 mr-2" />
                                    ) : (
                                      <MessageSquare size={12} className="text-gray-600 mt-1 mr-2" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-700">&quot;{comment.comment}&quot;</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(comment.timestamp).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic py-2">No comments for this section, only reactions.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4">This reviewer hasn&apos;t provided detailed feedback yet.</p>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewerFeedbackPopup;
