"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, User, ExternalLink } from 'lucide-react';
import { loadBoardFeedback, generateSeededRandom, generateColor, ReviewerFeedback as ReviewerFeedbackType, SectionFeedback, FeedbackItem } from '@/lib/feedbackService';
import { Section } from '@/app/tablero/types';
import ReviewerFeedbackPopup from '@/components/ui/popups/ReviewerFeedbackPopup';

interface BoardReviewerFeedbackProps {
  board: {
    id: string;
    sections?: Section[];
    reviewCount?: number;
  };
}

// Using types from feedbackService.ts

// Función para generar datos de ejemplo de reviewers cuando no hay datos reales
const generateMockReviewers = (boardId: string, count: number): ReviewerFeedbackType[] => {
  const reviewers: ReviewerFeedbackType[] = [];
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
        
        feedbackItems[itemId] = {
          itemId,
          reaction,
          comments: itemComments
        };
        
        // Agregar a la lista de paletteFeedbacks
        paletteFeedbacks.push({
          paletteId: itemId,
          type: reaction,
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

const BoardReviewerFeedback: React.FC<BoardReviewerFeedbackProps> = ({ board }) => {
  const [reviewers, setReviewers] = useState<ReviewerFeedbackType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerFeedbackType | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  
  // Cargar datos de feedback reales
  useEffect(() => {
    // Intentar cargar feedback real desde localStorage
    const boardFeedback = loadBoardFeedback(board.id);
    
    if (boardFeedback.reviewers.length > 0) {
      setReviewers(boardFeedback.reviewers);
      setIsLoading(false);
    } else {
      // Si no hay datos reales, generar datos de ejemplo para demostración
      // en un entorno de producción real, esto se eliminaría
      const mockReviewers = generateMockReviewers(board.id, board.reviewCount || 3);
      setReviewers(mockReviewers);
      setIsLoading(false);
    }
  }, [board.id, board.reviewCount]);
  
  // Abrir el popup de feedback detallado
  const openPopup = (reviewer: ReviewerFeedbackType) => {
    setSelectedReviewer(reviewer);
    setIsPopupOpen(true);
  };
  
  // Cerrar el popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };
  
  // Ya no necesitamos esta función ya que usamos un estilo consistente para todas las tarjetas
  
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
    <div className="mt-8 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-700">Reviewer Feedback</h2>
      </div>
      
      {reviewers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No feedback has been received yet for this board.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviewers.map((reviewer) => {
            // Calcular estadísticas de feedback para este revisor
            const positiveReactions = Object.values(reviewer.responses).reduce((total, section) => {
              if (section.paletteFeedbacks) {
                return total + section.paletteFeedbacks.filter(f => f.type === 'positive').length;
              }
              return total + Object.values(section.feedbackItems || {}).filter(item => item.reaction === 'positive').length;
            }, 0);
            
            const negativeReactions = Object.values(reviewer.responses).reduce((total, section) => {
              if (section.paletteFeedbacks) {
                return total + section.paletteFeedbacks.filter(f => f.type === 'negative').length;
              }
              return total + Object.values(section.feedbackItems || {}).filter(item => item.reaction === 'negative').length;
            }, 0);
            
            const commentCount = Object.values(reviewer.responses).reduce((total, section) => {
              return total + (section.comments?.length || 0);
            }, 0);
            
            return (
              <div 
                key={reviewer.reviewerId} 
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 relative h-[185px] cursor-pointer transition-all hover:shadow-md"
                onClick={() => openPopup(reviewer)}
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
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                      <User className="w-4 h-4 text-gray-700" />
                    </div>
                    <h3 className="font-medium text-gray-800 line-clamp-1 text-sm">{reviewer.reviewerName}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Last feedback: {formatDate(reviewer.lastUpdated)}
                  </p>
                </div>
                
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
      {selectedReviewer && (
        <ReviewerFeedbackPopup
          reviewer={selectedReviewer}
          sections={board.sections}
          isOpen={isPopupOpen}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default BoardReviewerFeedback;
