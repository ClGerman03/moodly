"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import BoardDetailHeader from "./components/BoardDetailHeader";
import BoardDetailSections from "./components/BoardDetailSections";
import BoardFeedbackOverview from "./components/BoardFeedbackOverview";
import BoardReviewerFeedback from "./components/BoardReviewerFeedback";
import { useBoardDetail } from "@/hooks/useBoardDetail";

export default function BoardDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const boardId = params?.id as string;
  
  // Utilizamos nuestro hook personalizado en lugar de los múltiples estados y efectos
  const { board, feedbackData, isLoading, isError, error } = useBoardDetail(boardId, user);

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
  if (isError || !board) {
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
            <h2 className="text-xl font-medium text-red-600 mb-4">
              {isError ? 'Error' : 'Board Not Found'}
            </h2>
            <p className="text-red-500 mb-4">
              {error instanceof Error ? error.message : 'Unable to load board details'}
            </p>
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
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl space-y-12">
            {/* Cabecera con datos generales del tablero */}
            <BoardDetailHeader board={board} />
            
            {/* Resumen general del feedback recibido */}
            <BoardFeedbackOverview board={board} feedbackData={feedbackData} />
            
            {/* Análisis de feedback por sección */}
            <BoardDetailSections board={board} feedbackData={feedbackData} />
            
            {/* Listado de feedback por revisor */}
            <BoardReviewerFeedback board={board} feedbackData={feedbackData} />
          </div>
        )}
      </div>
    </div>
  );
}
