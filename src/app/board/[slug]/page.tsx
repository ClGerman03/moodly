"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Section } from "@/app/tablero/types";

// Componentes de la experiencia de feedback
import WelcomeScreen from "./components/WelcomeScreen";
import FarewellScreen from "./components/FarewellScreen";
import NavigationControls from "./components/NavigationControls";
import SectionViewer from "./components/SectionViewer";
import FeedbackSummary from "./components/FeedbackSummary";

// Estados posibles de la experiencia de feedback
type ViewState = "welcome" | "sections" | "farewell" | "summary";

export default function PublicBoard() {
  const { slug } = useParams();
  const [boardData, setBoardData] = useState<{ name: string; sections: Section[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // Estados para la experiencia de feedback
  const [viewState, setViewState] = useState<ViewState>("welcome");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [clientName, setClientName] = useState("");
  const [feedback, setFeedback] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    if (slug && typeof slug === "string") {
      console.log('Cargando tablero con slug:', slug);
      // Buscar el tablero en localStorage
      try {
        const localStorageKey = `moodly-board-${slug}`;
        console.log('Buscando en localStorage con clave:', localStorageKey);
        
        const savedBoard = localStorage.getItem(localStorageKey);
        console.log('Datos encontrados en localStorage:', savedBoard ? 'Sí' : 'No');
        
        if (savedBoard) {
          // Parsear los datos guardados
          const parsedData = JSON.parse(savedBoard);
          console.log('Datos parseados:', parsedData);
          
          // Verificar que los datos tengan la estructura esperada
          if (parsedData && parsedData.name && Array.isArray(parsedData.sections)) {
            console.log('Estructura de datos válida, cargando tablero');
            setBoardData(parsedData);
            
            // Restaurar progreso del feedback si existe
            const savedFeedback = localStorage.getItem(`moodly-feedback-${slug}-${clientName}`);
            if (savedFeedback && clientName) {
              try {
                const parsedFeedback = JSON.parse(savedFeedback);
                setFeedback(parsedFeedback.responses || {});
                
                // Restaurar la última sección vista
                if (parsedFeedback.lastViewedSection !== undefined) {
                  setCurrentSectionIndex(parsedFeedback.lastViewedSection);
                  setViewState("sections");
                }
              } catch (e) {
                console.error("Error al restaurar el progreso del feedback:", e);
              }
            }
          } else {
            console.error('Estructura de datos inválida:', parsedData);
            setError("Formato de tablero inválido");
          }
        } else {
          console.log('No se encontró ningún tablero con ese slug');
          setError("Tablero no encontrado");
        }
      } catch (err) {
        console.error("Error al cargar el tablero:", err);
        setError("Error al cargar el tablero");
      } finally {
        setLoading(false);
      }
    }
  }, [slug, clientName]);

  // Manejar la navegación entre secciones
  const handleNext = () => {
    if (boardData?.sections && currentSectionIndex < boardData.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // Mostrar el resumen del feedback proporcionado cuando se completan todas las secciones
      setViewState("summary");
    }
    saveFeedbackProgress();
  };
  
  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };
  
  // Guardar selección para la sección actual
  const handleFeedback = (sectionId: string, data: Record<string, unknown>) => {
    setFeedback(prev => ({
      ...prev,
      [sectionId]: data
    }));
  };
  
  // Guardar progreso en localStorage
  const saveFeedbackProgress = () => {
    if (!slug || !clientName) return;
    
    localStorage.setItem(`moodly-feedback-${slug}-${clientName}`, JSON.stringify({
      boardId: slug,
      clientName,
      responses: feedback,
      lastViewedSection: currentSectionIndex,
      lastUpdated: new Date().toISOString()
    }));
  };
  
  // Manejar el inicio de la experiencia (desde WelcomeScreen)
  const handleStart = (name: string) => {
    setClientName(name);
    setViewState("sections");
  };
  
  // Manejar la finalización del resumen de feedback para ir a la pantalla de despedida
  const handleSummaryComplete = () => {
    setViewState("farewell");
    saveFeedbackProgress();
  };

  // Manejar la finalización de la experiencia (desde FarewellScreen)
  const handleFinish = () => {
    // Only show acknowledgment that feedback is complete
    // No redirection needed as this is for end users providing feedback
    console.log("Feedback process completed");
    // Optional: Any final actions like saving to server can be added here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  if (error || !boardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-4">
            {error || "Tablero no encontrado"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El tablero que estás buscando no existe o ha sido eliminado.
          </p>
          <a 
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {viewState === "welcome" && (
        <WelcomeScreen 
          boardName={boardData.name}
          onStart={handleStart}
        />
      )}
      
      {viewState === "sections" && (
        <>
          {/* El componente ProgressIndicator ha sido eliminado para una experiencia más limpia */}
          
          <div className="pt-6 pb-16"> {/* Reducimos el padding inferior */}
            <header className="text-center mb-6">
              <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200">
                {boardData.name}
              </h1>
            </header>
          
            <SectionViewer
              section={boardData.sections[currentSectionIndex]}
              onFeedback={(sectionId, data) => handleFeedback(sectionId, data)}
            />
          </div>
          
          <NavigationControls
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentSectionIndex === 0}
            isLast={currentSectionIndex === boardData.sections.length - 1}
          />
        </>
      )}
      
      {viewState === "summary" && (
        <FeedbackSummary
          sections={boardData.sections}
          feedback={feedback}
          clientName={clientName}
          onFinish={handleSummaryComplete}
        />
      )}
      
      {viewState === "farewell" && (
        <FarewellScreen 
          boardName={boardData.name}
          clientName={clientName}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}
