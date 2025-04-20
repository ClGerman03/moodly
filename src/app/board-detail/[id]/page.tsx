"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import BoardDetailHeader from "./components/BoardDetailHeader";
import BoardDetailSections from "./components/BoardDetailSections";
import BoardFeedbackOverview from "./components/BoardFeedbackOverview";
import BoardReviewerFeedback from "./components/BoardReviewerFeedback";
import { Section } from "@/app/tablero/types";

interface BoardDetail {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  slug?: string;
  isPublished?: boolean;
  reviewCount?: number;
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

export default function BoardDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const boardId = params?.id as string;
  
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !boardId) return;

    // Función para cargar los datos del tablero
    const loadBoardDetail = () => {
      try {
        // Simulamos un tiempo de carga para mostrar el indicador
        setTimeout(() => {
          // Intentar obtener el tablero desde localStorage
          const storageKey = `moodly-board-${boardId}`;
          const boardData = localStorage.getItem(storageKey);
          
          if (!boardData) {
            setError("Board not found");
            setIsLoading(false);
            return;
          }
          
          const parsedBoard = JSON.parse(boardData);
          
          // Verificar si el tablero pertenece al usuario actual
          if (parsedBoard.userId !== user.id) {
            setError("You don't have permission to view this board");
            setIsLoading(false);
            return;
          }
          
          // Generar un número consistente de revisores basado en el ID del tablero
          // Esto asegura que siempre obtengamos el mismo número para el mismo tablero
          const seededRandom = generateSeededRandom(boardId + '-reviewers');
          const reviewCount = Math.floor(seededRandom * 10) + 1; // Entre 1 y 10 revisores
          
          setBoard({
            ...parsedBoard,
            id: boardId,
            reviewCount: reviewCount
          });
          setIsLoading(false);
        }, 800); // Simular tiempo de carga
      } catch (err) {
        console.error("Error loading board:", err);
        setError("Error loading board details");
        setIsLoading(false);
      }
    };
    
    loadBoardDetail();
  }, [user, boardId]);

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading board details...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Navegación de regreso al dashboard */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        
        {board && (
          <>
            {/* Encabezado con información general del tablero */}
            <BoardDetailHeader board={board} />
            
            {/* Resumen del feedback recibido */}
            <BoardFeedbackOverview board={board} />
            
            {/* Feedback detallado por revisor */}
            <BoardReviewerFeedback board={board} />
            
            {/* Secciones del tablero */}
            <BoardDetailSections board={board} />
          </>
        )}
      </div>
    </div>
  );
}
