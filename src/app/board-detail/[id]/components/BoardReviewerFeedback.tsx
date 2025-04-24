"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { generateSeededRandom } from '@/lib/feedbackService';
import { Section } from '@/app/tablero/types';
import ReviewerFeedbackPopup from '@/components/ui/popups/ReviewerFeedbackPopup';

interface BoardReviewerFeedbackProps {
  // Compatibilidad con la versión anterior
  board?: {
    id: string;
    sections?: Section[];
    reviewCount?: number;
  };
  feedbackData?: {
    reviewers: {
      id: string;
      name: string;
      lastUpdated: string;
      completed: boolean;
      itemCount: number;
    }[];
    feedbackStats: {
      totalReactions: number;
      positiveReactions: number;
      negativeReactions: number;
      neutralReactions: number;
      totalComments: number;
      commentsBySection: Record<string, number>;
    };
    feedbackItems: Record<string, { itemId: string; section_id: string; reaction: 'positive' | 'negative' | 'neutral'; comments: { text: string; timestamp: string }[] }[]>;
  } | null;
  // Soporte para el nuevo formato desde useBoardDetail
  reviewers?: {
    id: string;
    name: string;
    lastUpdated: string;
    completed: boolean;
    itemCount: number;
  }[];
}

// Importamos los tipos desde supabase.ts para estandarizar las definiciones en todo el proyecto
import { SectionFeedback, FeedbackItem } from "@/types/supabase";

// Definición del tipo para la vista de reviewer feedback consistente con ReviewerFeedbackPopup
import type { ReviewerFeedback } from "@/components/ui/popups/ReviewerFeedbackPopup";

// Definimos correctamente un tipo unión para manejar los diferentes formatos de reviewers
// En lugar de extender la interfaz, creamos un tipo que puede ser cualquiera de los dos formatos
type ReviewerData = ReviewerFeedback | {
  id: string;
  name: string;
  lastUpdated: string;
  completed: boolean;
  itemCount: number;
}

// Función auxiliar para generar colores deterministas
const generateColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a color based on the hash
  const r = (hash & 0xFF) % 200 + 30; // Avoid too dark or too light
  const g = ((hash >> 8) & 0xFF) % 200 + 30;
  const b = ((hash >> 16) & 0xFF) % 200 + 30;
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Función para generar datos de ejemplo de reviewers cuando no hay datos reales
const generateMockReviewers = (boardId: string, count: number): ReviewerFeedback[] => {
  const reviewers: ReviewerFeedback[] = [];
  const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Charlie'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  
  for (let i = 0; i < count; i++) {
    const reviewerId = `reviewer-${boardId}-${i}`;
    const random = generateSeededRandom(reviewerId);
    const firstNameIndex = Math.floor(random * firstNames.length);
    const lastNameIndex = Math.floor(generateSeededRandom(reviewerId + 'last') * lastNames.length);
    
    const reviewerName = `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex].charAt(0)}.`;
    
    // Crear datos de ejemplo para las respuestas
    const responses: Record<string, SectionFeedback> = {};
    
    // Número aleatorio de secciones con feedback (entre 1 y 3)
    const sectionsCount = Math.floor(generateSeededRandom(reviewerId + 'sections') * 3) + 1;
    
    for (let j = 0; j < sectionsCount; j++) {
      const sectionId = `section-${boardId}-${j}`;
      
      // Crear feedback para elementos dentro de la sección
      const feedbackItems: Record<string, FeedbackItem> = {};
      const comments: {itemId: string; comment: string; timestamp: string}[] = [];
      const paletteFeedbacks: {paletteId: string; type: 'positive' | 'negative' | 'neutral'; timestamp: string}[] = [];
      
      // Número aleatorio de elementos con feedback (entre 1 y 4)
      const itemsCount = Math.floor(generateSeededRandom(reviewerId + sectionId) * 4) + 1;
      
      for (let k = 0; k < itemsCount; k++) {
        const itemId = `item-${boardId}-${j}-${k}`;
        const reaction = generateSeededRandom(reviewerId + itemId) > 0.3 ? 'positive' : 'negative';
        
        // Probabilidad de tener comentarios
        const hasComment = generateSeededRandom(reviewerId + itemId + 'comment') > 0.4;
        
        const itemComments = [];
        if (hasComment) {
          const commentOptions = [
            "I really like this design approach.",
            "This works well with the overall theme.",
            "Great choice of elements here.",
            "This could use some refinement.",
            "I&#39;m not convinced by this direction.",
            "Maybe try a different approach here.",
            "This is exactly what I had in mind.",
            "Consider adjusting this slightly.",
            "Perfect balance in this section.",
            "This doesn&#39;t quite match the brief."
          ];
          
          const commentIndex = Math.floor(generateSeededRandom(reviewerId + itemId + 'comment-text') * commentOptions.length);
          const timestamp = new Date(Date.now() - Math.floor(generateSeededRandom(reviewerId + itemId + 'time') * 7 * 24 * 60 * 60 * 1000)).toISOString();
          
          const comment = {
            text: commentOptions[commentIndex],
            timestamp
          };
          
          itemComments.push(comment);
          
          // Agregar a la lista de comentarios
          comments.push({
            itemId,
            comment: commentOptions[commentIndex],
            timestamp
          });
        }
        
        // Adaptar a la estructura esperada por supabase.ts FeedbackItem
        feedbackItems[itemId] = {
          id: itemId,
          type: reaction,
          reaction: reaction,
          timestamp: new Date().toISOString()
        };
        
        // Agregar a la lista de paletteFeedbacks
        paletteFeedbacks.push({
          paletteId: itemId,
          type: reaction as 'positive' | 'negative' | 'neutral',
          timestamp: new Date(Date.now() - Math.floor(generateSeededRandom(reviewerId + itemId + 'palette-time') * 7 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }
      
      responses[sectionId] = {
        feedbackItems,
        comments,
        paletteFeedbacks
      } as SectionFeedback;
    }
    
    reviewers.push({
      reviewerId,
      reviewerName,
      reviewerAvatar: `https://source.boringavatars.com/beam/120/${encodeURIComponent(reviewerName)}?colors=${encodeURIComponent(generateColor(reviewerId).substring(1))}`,
      lastUpdated: new Date(Date.now() - Math.floor(generateSeededRandom(reviewerId + 'update') * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      responses
    });
  }
  
  return reviewers;
};

const BoardReviewerFeedback: React.FC<BoardReviewerFeedbackProps> = ({ board, feedbackData, reviewers }) => {
  // Estado para el popup
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerFeedback | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mapear revisores desde los datos del servicio
  const reviewersList = useMemo(() => {
    if (reviewers) {
      // Cuando recibimos reviewers desde useBoardDetail, necesitamos convertirlos al formato ReviewerFeedback
      return reviewers.map(reviewer => {
        // Generar avatar consistente basado en el ID
        const avatarSeed = reviewer.id || reviewer.name;
        const color = generateColor(avatarSeed);
        const name = reviewer.name;
        
        // Crear una estructura compatible con ReviewerFeedback
        return {
          reviewerId: reviewer.id,
          reviewerName: name,
          reviewerAvatar: color,
          lastUpdated: reviewer.lastUpdated,
          responses: {} as Record<string, SectionFeedback>,
          // Propiedades para compatibilidad con los cálculos de estadísticas
          id: reviewer.id,
          name: reviewer.name,
          completed: reviewer.completed,
          itemCount: reviewer.itemCount
        } as ReviewerData;
      });
    } else if (feedbackData && feedbackData.reviewers && feedbackData.reviewers.length > 0) {
      // Transformar los datos al formato esperado por el componente
      return feedbackData.reviewers.map(reviewer => {
        // Generar avatar consistente basado en el ID
        const avatarSeed = reviewer.id || reviewer.name;
        const color = generateColor(avatarSeed);
        const name = reviewer.name;
        
        // Transforma los datos de feedback a la estructura esperada
        const responses: Record<string, SectionFeedback> = {};
        
        // Verificar que board exista y tenga secciones
        if (board && board.sections) {
          // Recorrer las secciones del board
          board.sections.forEach(section => {
            // Para cada sección, buscar si hay feedback items asociados
            if (feedbackData && feedbackData.feedbackItems && feedbackData.feedbackItems[reviewer.id]) {
              // Filtrar solo los items de esta sección
              const sectionItems = feedbackData.feedbackItems[reviewer.id].filter(
                item => item.section_id === section.id
              );
              
              // Si hay items para esta sección, crear la entrada en responses
              if (sectionItems.length > 0) {
                responses[section.id] = {
                  feedbackItems: {}
                } as SectionFeedback;
                
                // Convertir los items al formato esperado por SectionFeedback
                sectionItems.forEach(item => {
                  if (responses[section.id].feedbackItems) {
                    responses[section.id].feedbackItems[item.itemId] = {
                      id: item.itemId,
                      type: item.reaction,
                      reaction: item.reaction,
                      timestamp: new Date().toISOString()
                    };
                  }
                  
                  // Si hay comentarios, añadirlos también
                  if (item.comments && item.comments.length > 0) {
                    if (!responses[section.id].comments) {
                      responses[section.id].comments = [];
                    }
                    
                    item.comments.forEach(comment => {
                      responses[section.id].comments?.push({
                        itemId: item.itemId,
                        comment: comment.text,
                        timestamp: comment.timestamp
                      });
                    });
                  }
                });
              }
            }
          });
        }
        
        return {
          reviewerId: reviewer.id,
          reviewerName: name,
          reviewerAvatar: color,
          lastUpdated: reviewer.lastUpdated,
          responses,
          // Propiedades adicionales para mantener compatibilidad
          id: reviewer.id,
          name: reviewer.name,
          completed: reviewer.completed,
          itemCount: reviewer.itemCount
        } as ReviewerData;
      });
    } else if (board && board.reviewCount) {
      // Si no hay datos reales, generar datos de ejemplo
      return generateMockReviewers(board.id, board.reviewCount) as ReviewerData[];
    }
    
    return [] as ReviewerData[];
  }, [feedbackData, board, reviewers]);
  
  useEffect(() => {
    // Marcar como cargado cuando tengamos los datos
    setIsLoading(false);
  }, [reviewersList]);
  
  /**
   * Abre el popup de feedback con los datos del revisor seleccionado
   * @param reviewer - Datos del revisor que se mostrarán en el popup
   */
  const openPopup = (reviewer: ReviewerFeedback) => {
    setSelectedReviewer(reviewer);
    setIsPopupOpen(true);
    
    // Para depuración - información de qué datos se envían al popup
    console.log('Abriendo popup con datos del revisor:', reviewer);
  };
  
  /**
   * Cierra el popup de feedback
   */
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedReviewer(null);
  };
  
  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-6">Reviewer Feedback</h2>
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-12 mb-6">
      <h2 className="text-xl font-light text-gray-700 mb-6">Feedback por Revisor</h2>
      
      {reviewersList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No feedback has been received yet for this board.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviewersList.map((reviewer) => {
            // Tipo guard para verificar si es el formato con 'responses' o con 'itemCount'
            const isReviewerFeedback = (r: ReviewerData): r is ReviewerFeedback => {
              return 'responses' in r;
            };
            
            const isNewFormatReviewer = (r: ReviewerData): r is {
              id: string;
              name: string;
              lastUpdated: string;
              completed: boolean;
              itemCount: number;
            } => {
              return 'itemCount' in r;
            };
            
            // Calcular estadísticas de feedback para este revisor
            // Con manejo seguro de tipos
            let positiveReactions = 0;
            let negativeReactions = 0;
            let commentCount = 0;
            
            if (isReviewerFeedback(reviewer) && reviewer.responses) {
              positiveReactions = Object.values(reviewer.responses).reduce((total, section) => {
                if ('paletteFeedbacks' in section && section.paletteFeedbacks) {
                  return total + section.paletteFeedbacks.filter(f => f.type === 'positive').length;
                }
                if ('feedbackItems' in section && section.feedbackItems) {
                  return total + Object.values(section.feedbackItems || {}).filter(item => item.reaction === 'positive').length;
                }
                return total;
              }, 0);
              
              negativeReactions = Object.values(reviewer.responses).reduce((total, section) => {
                if ('paletteFeedbacks' in section && section.paletteFeedbacks) {
                  return total + section.paletteFeedbacks.filter(f => f.type === 'negative').length;
                }
                if ('feedbackItems' in section && section.feedbackItems) {
                  return total + Object.values(section.feedbackItems || {}).filter(item => item.reaction === 'negative').length;
                }
                return total;
              }, 0);

              commentCount = Object.values(reviewer.responses).reduce((total, section) => {
                let count = 0;
                if ('comments' in section && section.comments) {
                  count += section.comments.length;
                }
                return total + count;
              }, 0);
            } else if (isNewFormatReviewer(reviewer) && reviewer.itemCount) {
              // Si no tenemos datos detallados de responses pero sí itemCount, estimamos valores
              positiveReactions = Math.floor(reviewer.itemCount * 0.6); // 60% positivas
              negativeReactions = Math.floor(reviewer.itemCount * 0.2); // 20% negativas
              commentCount = Math.floor(reviewer.itemCount * 0.3); // 30% con comentarios
            }
            
            return (
              <div 
                key={isReviewerFeedback(reviewer) ? reviewer.reviewerId : reviewer.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 relative h-[185px] cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  // Asegurarnos de que el revisor sea compatible con ReviewerFeedback antes de pasarlo a openPopup
                  if (isReviewerFeedback(reviewer)) {
                    openPopup(reviewer);
                  }
                }}
                data-testid={`reviewer-card-${isReviewerFeedback(reviewer) ? reviewer.reviewerId : reviewer.id}`}
              >
                {/* Indicador de actividad (similar al punto verde en BoardsSection) */}
                <div className="absolute top-3 right-3">
                  <div className="relative w-2.5 h-2.5">
                    <div className="absolute inset-0 bg-blue-300 rounded-full opacity-30"></div>
                    <div className="absolute inset-0.5 bg-blue-400 rounded-full opacity-60"></div>
                    <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Información del revisor */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full mr-2" style={{ 
                    backgroundColor: isReviewerFeedback(reviewer) ? reviewer.reviewerAvatar : generateColor(reviewer.id)
                  }}></div>
                  <div>
                    <h3 className="font-medium text-gray-800 leading-tight -mb-1 text-sm">
                      {isReviewerFeedback(reviewer) ? reviewer.reviewerName : reviewer.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Last feedback: {formatDate(reviewer.lastUpdated)}
                </p>
                
                {/* Estadísticas de feedback en forma de badge */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="px-2 py-1 bg-green-50 rounded-full text-xs flex items-center">
                    <ThumbsUp size={12} className="text-green-500 mr-1" />
                    <span className="text-green-700">{positiveReactions}</span>
                  </div>
                  
                  <div className="px-2 py-1 bg-red-50 rounded-full text-xs flex items-center">
                    <ThumbsDown size={12} className="text-red-500 mr-1" />
                    <span className="text-red-700">{negativeReactions}</span>
                  </div>
                  
                  <div className="px-2 py-1 bg-blue-50 rounded-full text-xs flex items-center">
                    <MessageSquare size={12} className="text-blue-500 mr-1" />
                    <span className="text-blue-700">{commentCount}</span>
                  </div>
                </div>
                
                {/* Botón de acción en la parte inferior */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>View Feedback</span>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Popup para mostrar el feedback detallado */}
      {selectedReviewer && isPopupOpen && (
        <ReviewerFeedbackPopup
          reviewer={selectedReviewer}
          sections={board?.sections || []}
          isOpen={isPopupOpen}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default BoardReviewerFeedback;
