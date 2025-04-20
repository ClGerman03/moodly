import React from 'react';
import Image from 'next/image';

// Tipo para la información de un revisor
interface Reviewer {
  id: string;
  avatar?: string;
  name?: string;
}

interface BoardReviewersProps {
  reviewers?: Reviewer[];
  reviewCount?: number;
}

/**
 * Componente que muestra los revisores de un tablero como círculos de avatar
 * y la cantidad total de personas que han revisado el tablero
 */
const BoardReviewers: React.FC<BoardReviewersProps> = ({ reviewers = [], reviewCount = 0 }) => {
  // Por ahora, generamos revisores ficticios para la demostración visual
  const demoReviewers: Reviewer[] = reviewers.length > 0 ? reviewers : [
    { id: '1', avatar: '/avatars/avatar-1.png' },
    { id: '2', avatar: '/avatars/avatar-2.png' },
    { id: '3', avatar: '/avatars/avatar-3.png' },
  ];

  // Limitamos a mostrar máximo 3 avatares
  const visibleReviewers = demoReviewers.slice(0, 3);
  
  // Calculamos cuántos revisores adicionales hay
  const additionalReviewers = Math.max(0, (reviewCount || demoReviewers.length) - visibleReviewers.length);
  
  return (
    <div className="flex items-center mt-3 mb-1">
      <div className="flex -space-x-2 mr-2">
        {visibleReviewers.map((reviewer, index) => (
          <div 
            key={reviewer.id} 
            className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
            style={{ zIndex: visibleReviewers.length - index }}
          >
            {reviewer.avatar ? (
              <Image 
                src={reviewer.avatar} 
                alt={reviewer.name || `Reviewer ${index + 1}`} 
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            ) : (
              // Avatar placeholder con iniciales o color aleatorio
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-medium">
                {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : index + 1}
              </div>
            )}
          </div>
        ))}
        
        {/* Mostrar indicador de revisores adicionales si hay más de los que mostramos */}
        {additionalReviewers > 0 && (
          <div 
            className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium"
            style={{ zIndex: 0 }}
          >
            +{additionalReviewers}
          </div>
        )}
      </div>
      
      <span className="text-xs text-gray-500">
        {reviewCount || demoReviewers.length} {(reviewCount || demoReviewers.length) === 1 ? 'reviewer' : 'reviewers'}
      </span>
    </div>
  );
};

export default BoardReviewers;
