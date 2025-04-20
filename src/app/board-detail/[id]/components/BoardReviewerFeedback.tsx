"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { loadBoardFeedback, generateSeededRandom, generateColor, ReviewerFeedback as ReviewerFeedbackType, SectionFeedback, FeedbackItem } from '@/lib/feedbackService';
import { Section } from '@/app/tablero/types';

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
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [reviewers, setReviewers] = useState<ReviewerFeedbackType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Cargar datos de feedback reales
  useEffect(() => {
    // Intentar cargar feedback real desde localStorage
    const boardFeedback = loadBoardFeedback(board.id);
    
    if (boardFeedback.reviewers.length > 0) {
      // Si hay datos reales, usarlos
      setReviewers(boardFeedback.reviewers);
    } else {
      // Si no hay datos reales, generar datos de ejemplo
      const count = board.reviewCount || Math.floor(generateSeededRandom(board.id + '-count') * 5) + 3;
      setReviewers(generateMockReviewers(board.id, count));
    }
    
    setIsLoading(false);
  }, [board.id, board.reviewCount]);
  
  const toggleReviewer = (reviewerId: string) => {
    setSelectedReviewer(selectedReviewer === reviewerId ? null : reviewerId);
    // Resetear secciones expandidas cuando cambiamos de reviewer
    setExpandedSections({});
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Función para obtener nombre de sección
  const getSectionName = (sectionId: string) => {
    // Intentar encontrar el nombre real de la sección
    if (board.sections) {
      const sectionIndex = parseInt(sectionId.split('-').pop() || '0');
      if (board.sections[sectionIndex]) {
        return board.sections[sectionIndex].title || `Section ${sectionIndex + 1}`;
      }
    }
    return `Section ${parseInt(sectionId.split('-').pop() || '0') + 1}`;
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
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 shadow-sm">
      <h2 className="text-lg font-medium text-gray-800 mb-6">Reviewer Feedback</h2>
      
      {reviewers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No feedback has been received yet for this board.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewers.map((reviewer) => (
            <div key={reviewer.reviewerId} className="border border-gray-100 rounded-lg overflow-hidden">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${selectedReviewer === reviewer.reviewerId ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => toggleReviewer(reviewer.reviewerId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                    <Image 
                      src={reviewer.reviewerAvatar}
                      alt={reviewer.reviewerName}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{reviewer.reviewerName}</h3>
                    <p className="text-xs text-gray-500">Last feedback: {formatDate(reviewer.lastUpdated)}</p>
                  </div>
                </div>
                
                {/* Estadísticas de feedback en breve */}
                <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    <ThumbsUp size={14} className="text-green-500 mr-1" />
                    <span className="text-xs text-gray-600">
                      {Object.values(reviewer.responses).reduce((total, section) => {
                        if (section.paletteFeedbacks) {
                          return total + section.paletteFeedbacks.filter(f => f.type === 'positive').length;
                        }
                        return total + Object.values(section.feedbackItems || {}).filter(item => item.reaction === 'positive').length;
                      }, 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mr-4">
                    <MessageSquare size={14} className="text-blue-500 mr-1" />
                    <span className="text-xs text-gray-600">
                      {Object.values(reviewer.responses).reduce((total, section) => {
                        return total + (section.comments?.length || 0);
                      }, 0)}
                    </span>
                  </div>
                  
                  {selectedReviewer === reviewer.reviewerId ? 
                    <ChevronDown size={18} className="text-gray-400" /> : 
                    <ChevronRight size={18} className="text-gray-400" />
                  }
                </div>
              </div>
              
              {/* Detalles del feedback */}
              <AnimatePresence>
                {selectedReviewer === reviewer.reviewerId && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {Object.keys(reviewer.responses).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(reviewer.responses).map(([sectionId, sectionData]) => (
                            <div key={sectionId} className="border border-gray-100 rounded-lg overflow-hidden">
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleSection(sectionId)}
                              >
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-700">{getSectionName(sectionId)}</h4>
                                </div>
                                
                                <div className="flex items-center">
                                  <div className="flex items-center mr-3">
                                    <ThumbsUp size={14} className="text-green-500 mr-1" />
                                    <span className="text-xs text-gray-600">
                                      {(sectionData.paletteFeedbacks || []).filter(f => f.type === 'positive').length || 
                                       Object.values(sectionData.feedbackItems || {}).filter(item => item.reaction === 'positive').length}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center mr-3">
                                    <ThumbsDown size={14} className="text-red-500 mr-1" />
                                    <span className="text-xs text-gray-600">
                                      {(sectionData.paletteFeedbacks || []).filter(f => f.type === 'negative').length || 
                                       Object.values(sectionData.feedbackItems || {}).filter(item => item.reaction === 'negative').length}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center mr-4">
                                    <MessageSquare size={14} className="text-blue-500 mr-1" />
                                    <span className="text-xs text-gray-600">{sectionData.comments?.length || 0}</span>
                                  </div>
                                  
                                  {expandedSections[sectionId] ? 
                                    <ChevronDown size={16} className="text-gray-400" /> : 
                                    <ChevronRight size={16} className="text-gray-400" />
                                  }
                                </div>
                              </div>
                              
                              {/* Comentarios de la sección */}
                              <AnimatePresence>
                                {expandedSections[sectionId] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-gray-50 p-3 space-y-2">
                                      {sectionData.comments && sectionData.comments.length > 0 ? (
                                        sectionData.comments.map((comment, index) => {
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
                                            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                                              <div className="flex items-start">
                                                <div className={`mt-1 w-2 h-2 rounded-full mr-2 ${
                                                  reaction === 'positive' ? 'bg-green-500' : 
                                                  reaction === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`}
                                                ></div>
                                                <div>
                                                  <p className="text-sm text-gray-700">{comment.comment}</p>
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
                                        })
                                      ) : (
                                        <p className="text-xs text-gray-500 italic py-2">No comments for this section, only reactions.</p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 py-4">This reviewer hasn&#39;t provided detailed feedback yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardReviewerFeedback;
