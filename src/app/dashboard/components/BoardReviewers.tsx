import React from 'react';
import { User } from 'lucide-react';

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
  
  // Generar colores distintos para los iconos de usuarios basados en su ID
  const generateBackgroundColor = (userId: string, index: number) => {
    const colors = [
      'bg-blue-300',   // Azul pastel
      'bg-green-300',  // Verde pastel
      'bg-purple-300', // Morado pastel
      'bg-pink-300',   // Rosa pastel
      'bg-orange-300', // Naranja pastel
      'bg-teal-300'    // Verde azulado pastel
    ];
    
    // Usar el índice o el id para obtener un color consistente
    const colorIndex = userId ? 
      userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 
      index % colors.length;
      
    return colors[colorIndex];
  };

  return (
    <div className="flex items-center mt-3 mb-1">
      <div className="flex -space-x-2 mr-2">
        {visibleReviewers.map((reviewer, index) => {
          const bgColorClass = generateBackgroundColor(reviewer.id, index);
          
          return (
            <div 
              key={reviewer.id} 
              className={`w-7 h-7 rounded-full border-2 border-white ${bgColorClass} overflow-hidden flex items-center justify-center`}
              style={{ zIndex: visibleReviewers.length - index }}
            >
              <User className="w-4 h-4 text-gray-700" />
            </div>
          );
        })}
        
        {/* Mostrar indicador de revisores adicionales si hay más de los que mostramos */}
        {additionalReviewers > 0 && (
          <div 
            className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium"
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
