import React, { useMemo } from 'react';
import { ThumbsUp, MessageSquare, Users } from 'lucide-react';
import BoardReviewers from '@/app/dashboard/components/BoardReviewers';

interface BoardFeedbackOverviewProps {
  board: {
    id: string;
    reviewCount?: number;
  };
}

// Función auxiliar para generar un número pseudoaleatorio determinístico basado en un string
function generateSeededRandom(seed: string) {
  // Convierte el string en un número simple
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convierte a entero de 32 bits
  }
  
  // Genera un número entre 0 y 1 basado en el hash
  const random = Math.abs(Math.sin(hash) * 10000) % 1;
  return random;
}

const BoardFeedbackOverview: React.FC<BoardFeedbackOverviewProps> = ({ board }) => {
  // Usamos useMemo para generar datos de ejemplo solo una vez por tablero
  const feedbackStats = useMemo(() => {
    // Usar generateSeededRandom para valores consistentes
    const reactionsRandom = generateSeededRandom(board.id + '-reactions');
    const commentsRandom = generateSeededRandom(board.id + '-comments');
    
    const totalReactions = Math.floor(reactionsRandom * 20) + (board.reviewCount || 5);
    const totalComments = Math.floor(commentsRandom * 15) + 2;
    const positiveReactions = Math.floor(totalReactions * 0.7); // 70% positivas
    
    return {
      totalReactions,
      totalComments,
      positiveReactions
    };
  }, [board.id, board.reviewCount]); // Solo recalcular si cambia el ID del tablero o el conteo de revisores
  
  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Feedback Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen de revisores */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Reviewers</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <BoardReviewers reviewCount={board.reviewCount} />
            <span className="text-2xl font-light text-gray-800">{board.reviewCount || 0}</span>
          </div>
        </div>
        
        {/* Resumen de reacciones */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Reactions</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2 bg-gray-100 rounded-full w-40 overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${(feedbackStats.positiveReactions / feedbackStats.totalReactions) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {feedbackStats.positiveReactions} positive of {feedbackStats.totalReactions} total
              </p>
            </div>
            <span className="text-2xl font-light text-gray-800">{feedbackStats.totalReactions}</span>
          </div>
        </div>
        
        {/* Resumen de comentarios */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <MessageSquare className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Comments</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              {/* Simulamos algunas previsualizaciones de comentarios */}
              <p className="text-xs text-gray-500 line-clamp-1">&quot;I love the color palette choices!&quot;</p>
              <p className="text-xs text-gray-500 line-clamp-1">&quot;The typography is cohesive with the overall theme.&quot;</p>
            </div>
            <span className="text-2xl font-light text-gray-800">{feedbackStats.totalComments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardFeedbackOverview;
