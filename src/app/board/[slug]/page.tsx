"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Section } from "@/app/tablero/types";
import { toast } from "react-hot-toast";

// Servicios
import { boardService, sectionService, feedbackService } from "@/services";
import { adaptBoardForDisplay, adaptLocalStorageBoardForDisplay, DisplayBoard } from "@/utils/adapters/boardAdapter";

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
  const [boardData, setBoardData] = useState<DisplayBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "localStorage" | null>(null);
  
  // Estados para la experiencia de feedback
  const [viewState, setViewState] = useState<ViewState>("welcome");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [clientName, setClientName] = useState("");
  const [feedback, setFeedback] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    async function loadBoard() {
      if (!slug || typeof slug !== "string") {
        setError("Invalid board URL");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // 1. Intentar cargar desde Supabase
        const board = await boardService.getBoardBySlug(slug);
        
        if (board) {
          console.log('Tablero encontrado en Supabase:', board.name);
          
          try {
            // Cargar las secciones
            const sections = await sectionService.getSectionsByBoardId(board.id);
            
            if (sections && sections.length > 0) {
              // Adaptar los datos al formato esperado por la aplicación
              const adaptedData = adaptBoardForDisplay(board, sections);
              setBoardData(adaptedData);
              setDataSource("supabase");
              
              console.log('Tablero cargado desde Supabase con', sections.length, 'secciones');
            } else {
              setError("No sections found for this board");
            }
          } catch (sectionError) {
            console.error("Error loading sections:", sectionError);
            setError("Error loading board sections");
          }
        } else {
          console.log('Tablero no encontrado en Supabase, buscando en localStorage...');
          
          // 2. Si no se encuentra en Supabase, buscar en localStorage (compatibilidad)
          const localStorageKey = `moodly-board-${slug}`;
          const savedBoard = localStorage.getItem(localStorageKey);
          
          if (savedBoard) {
            try {
              const parsedData = JSON.parse(savedBoard);
              const adaptedLocalData = adaptLocalStorageBoardForDisplay(parsedData);
              
              if (adaptedLocalData) {
                setBoardData(adaptedLocalData);
                setDataSource("localStorage");
                console.log('Tablero cargado desde localStorage');
              } else {
                setError("Invalid board data format");
              }
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
              setError("Error loading board data");
            }
          } else {
            setError("Board not found");
          }
        }
      } catch (err) {
        console.error("Error loading board:", err);
        setError("Error connecting to the database");
      } finally {
        setLoading(false);
      }
    }
    
    loadBoard();
  }, [slug]);
  
  // Cargar feedback existente cuando se establece el nombre del cliente
  useEffect(() => {
    if (slug && typeof slug === "string" && clientName) {
      // Intentar cargar feedback existente
      const savedFeedback = feedbackService.getLocalFeedback(slug, clientName);
      
      if (savedFeedback) {
        console.log('Feedback previo encontrado para', clientName);
        setFeedback(savedFeedback.responses || {});
        
        // Restaurar la última sección vista
        if (savedFeedback.lastViewedSection !== undefined) {
          setCurrentSectionIndex(savedFeedback.lastViewedSection);
          setViewState("sections");
          
          // Notificar al usuario que se ha restaurado su progreso
          toast.success(`Welcome back, ${clientName}! Your progress has been restored.`, {
            duration: 3000,
            position: 'bottom-center'
          });
        }
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
  
  // Guardar feedback para una sección específica
  const handleFeedback = (sectionId: string, data: Record<string, unknown>) => {
    setFeedback(prev => ({
      ...prev,
      [sectionId]: data
    }));
  };
  
  // Guardar progreso en localStorage
  const saveFeedbackProgress = () => {
    if (!slug || typeof slug !== "string" || !clientName) return;
    
    feedbackService.saveLocalFeedback(
      slug,
      clientName,
      feedback,
      currentSectionIndex
    );
  };
  
  // Manejar el inicio de la experiencia (desde WelcomeScreen)
  const handleStart = (name: string) => {
    setClientName(name);
    setViewState("sections");
  };
  
  // Manejar la finalización del resumen de feedback para ir a la pantalla de despedida
  const handleSummaryComplete = async () => {
    setViewState("farewell");
    
    // Guardar localmente (compatibilidad)
    saveFeedbackProgress();
    
    // Si el tablero está en Supabase, guardar también ahí
    if (dataSource === "supabase" && slug && typeof slug === "string") {
      try {
        // Obtener el board por slug para tener su ID
        const board = await boardService.getBoardBySlug(slug);
        
        if (board) {
          await feedbackService.saveBoardReview(
            board.id,
            clientName,
            feedback,
            currentSectionIndex
          );
          console.log("Feedback guardado en Supabase correctamente");
        } else {
          console.error("No se pudo encontrar el tablero en Supabase para guardar el feedback");
        }
      } catch (error) {
        console.error("Error guardando feedback en Supabase:", error);
        toast.error("Error saving feedback to database", {
          position: 'bottom-center'
        });
      }
    }
  };

  // Manejar la finalización de la experiencia (desde FarewellScreen)
  const handleFinish = () => {
    // Notificar al usuario
    toast.success(`Thank you for your feedback, ${clientName}!`, {
      duration: 5000,
      position: 'bottom-center',
      icon: '👏'
    });
    
    // Redirigir al inicio después de un tiempo
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !boardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-4">
            {error || "Board not found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The board you're looking for doesn't exist or has been removed.
          </p>
          <a 
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Return to home
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
          <div className="pt-6 pb-16">
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
