'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { boardService, sectionService } from '@/services';
import { storageService } from '@/services/storageService';
import { supabase } from '@/lib/supabase';
import { Section, ImageMetadata } from '@/app/tablero/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

// Estado guardado en sessionStorage
interface StoredPublishState {
  isPublishing: boolean;
  isPublished: boolean;
  slug: string;
  boardId: string;
  timestamp: number;
}

// Interfaces para manejar errores
interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

interface UseBoardPublicationProps {
  boardName: string;
  boardId: string;
  currentSections: Section[];
  onPublishSuccess: (slug: string) => void;
}

export function useBoardPublication({
  boardName,
  boardId = 'mi-tablero',
  currentSections = [],
  onPublishSuccess
}: UseBoardPublicationProps) {
  // Obtener el estado de autenticación
  const { user } = useAuth();
  
  // Estados para la publicación
  const [customUrlSegment, setCustomUrlSegment] = useState(() => {
    // Generar un slug basado en el nombre del tablero
    return boardName
      ? boardName.toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      : boardId;
  });
  
  const [publishingError, setPublishingError] = useState<string | null>(null);
  const [boardLink, setBoardLink] = useState<string>('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Guardar estado de publicación
  const savePublishState = useCallback((state: StoredPublishState) => {
    sessionStorage.setItem(`publish-state-${boardId}`, JSON.stringify(state));
  }, [boardId]);
  
  // Procesamiento de imágenes con React Query
  const processImagesMutation = useMutation({
    mutationFn: async ({ sections, board_id }: { sections: Section[], board_id: string }) => {
      return Promise.all(
        sections.map(async (section) => {
          // Procesamiento específico para cada tipo de sección
          switch(section.type) {
            case 'imageGallery':
              try {
                const sectionToProcess = {
                  type: section.type,
                  data: section.data
                };
                
                const processedSection = await storageService.processSectionImages(sectionToProcess, board_id);
                const typedData = { ...processedSection.data };
                
                if (typedData.imageMetadata) {
                  const typedMetadata: { [key: string]: ImageMetadata } = {};
                  
                  Object.entries(typedData.imageMetadata).forEach(([key, value]) => {
                    if (value && typeof value === 'object') {
                      const rawValue = value as Record<string, unknown>;
                      typedMetadata[key] = {
                        title: typeof rawValue.title === 'string' ? rawValue.title : undefined,
                        description: typeof rawValue.description === 'string' ? rawValue.description : undefined,
                        tags: Array.isArray(rawValue.tags) ? rawValue.tags : []
                      };
                    }
                  });
                  
                  typedData.imageMetadata = typedMetadata;
                }
                
                return {
                  ...section,
                  data: typedData
                };
              } catch (error) {
                console.error(`Error processing images for section ${section.id}:`, error);
                return section;
              }
            
            // Otros tipos de secciones son pasados directamente sin procesamiento
            case 'links':
            case 'text':
            case 'typography':
            case 'palette':
            default:
              console.log(`Processing section of type ${section.type} (id: ${section.id})`);
              return section;
          }
        })
      );
    }
  });
  
  // Mutación principal para publicar
  const publishMutation = useMutation({
    mutationFn: async () => {
      // Verificar que el slug sea válido
      if (!customUrlSegment || customUrlSegment.trim() === "") {
        throw new Error("Please enter a valid name for the URL");
      }
      
      // Slug normalizado
      const finalSlug = customUrlSegment
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
        
      // Guardar el estado inicialmente
      savePublishState({
        isPublishing: true,
        isPublished: false,
        slug: finalSlug,
        boardId,
        timestamp: Date.now()
      });
      
      // Verificar si el usuario está autenticado
      if (!user) {
        // Usuario no autenticado - guardamos en localStorage y mostramos mensaje
        const migrationToast = toast.loading("Preparing board for local storage...");
        
        try {
          // Procesar las imágenes como siempre
          if (!currentSections || currentSections.length === 0) {
            toast.dismiss(migrationToast);
            throw new Error("No sections found for this board");
          }

          // Procesar imágenes para usuarios no autenticados
          const processedSections = await processImagesMutation.mutateAsync({
            sections: currentSections,
            board_id: boardId
          });
          
          // Guardar en localStorage con el formato adecuado
          const pendingBoardData = {
            name: boardName,
            slug: finalSlug,
            sections: processedSections,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pendingPublication: true
          };
          
          // Guardar en localStorage
          localStorage.setItem('moodly-pending-board', JSON.stringify(pendingBoardData));
          
          toast.success("Board saved locally. Sign in to publish!", { id: migrationToast });
          
          // Mostrar el prompt de autenticación
          setShowAuthPrompt(true);
          
          // Actualizar estado
          savePublishState({
            isPublishing: false,
            isPublished: true,
            slug: finalSlug,
            boardId,
            timestamp: Date.now()
          });
          
          return { success: true, slug: finalSlug, needsAuth: true };
        } catch (error) {
          console.error("Error preparing board for localStorage:", error);
          toast.error(`Error preparing board: ${isErrorWithMessage(error) ? error.message : "Unknown error"}`, { id: migrationToast });
          throw error;
        }
      }
      
      // Para usuarios autenticados: publicar directamente sin verificación previa
      // Esto simplifica el flujo y elimina el paso de "checking"
      const migrationToast = toast.loading("Publishing your board...");
      
      try {
        // Usar las secciones actuales del estado local
        if (!currentSections || currentSections.length === 0) {
          toast.dismiss(migrationToast);
          throw new Error("No sections found for this board");
        }
        
        // Procesar cada sección para migrar las imágenes
        const processedSections = await processImagesMutation.mutateAsync({
          sections: currentSections,
          board_id: boardId
        });
        
        // Declarar finalBoardId fuera del bloque condicional
        let finalBoardId = boardId;
        
        // Si el boardId es un valor por defecto, crear el tablero primero
        if (boardId === "mi-tablero" || !boardId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          try {
            const newBoard = await boardService.createBoard({
              name: boardName,
              slug: finalSlug,
              user_id: (await supabase.auth.getUser()).data.user?.id || '',
              is_published: true
            });
            finalBoardId = newBoard.id;
          } catch (error: unknown) {
            // Manejar errores específicamente para colisiones de slug
            if (isErrorWithMessage(error) && 
                (error.message.includes('duplicate key') || error.message.includes('already exists'))) {
              toast.dismiss(migrationToast);
              throw new Error("This URL is already taken. Please try a different one.");
            }
            throw error;
          }
        }
        
        // Guardar las secciones procesadas
        await sectionService.saveSections(finalBoardId, processedSections as Section[]);
        
        // Publicar el tablero en Supabase si todavía no se ha hecho
        if (boardId !== finalBoardId) {
          try {
            await boardService.publishBoard(finalBoardId, finalSlug);
          } catch (error: unknown) {
            // Si falla la publicación pero ya tenemos el tablero y secciones guardadas,
            // podemos seguir considerándolo un éxito
            console.warn("Error during final publish step, but data was saved:", 
              isErrorWithMessage(error) ? error.message : "Unknown error");
          }
        }
        
        toast.success("Board published successfully", { id: migrationToast });
        
        // Generar el enlace completo para compartir
        const baseUrl = window.location.origin;
        const fullBoardLink = `${baseUrl}/board/${finalSlug}`;
        setBoardLink(fullBoardLink);
        
        // Actualizar estado
        savePublishState({
          isPublishing: false,
          isPublished: true,
          slug: finalSlug,
          boardId: finalBoardId,
          timestamp: Date.now()
        });
        
        return { success: true, slug: finalSlug, needsAuth: false, boardLink: fullBoardLink };
      } catch (error) {
        console.error("Error publishing board:", error);
        toast.error(`Error publishing board: ${isErrorWithMessage(error) ? error.message : "Unknown error"}`, { id: migrationToast });
        throw error;
      }
    },
    onSuccess: (data) => {
      if (!data.needsAuth) {
        onPublishSuccess(data.slug);
      }
    },
    onError: (error) => {
      setPublishingError(isErrorWithMessage(error) ? error.message : "Unknown error occurred");
      // Limpiar el estado en caso de error
      savePublishState({
        isPublishing: false,
        isPublished: false,
        slug: customUrlSegment,
        boardId,
        timestamp: Date.now()
      });
    }
  });
  
  // Verificar el estado de publicación (simplificado)
  const checkPublicationStatus = useCallback(async (slug: string) => {
    try {
      // Consideramos que si el enlace se generó correctamente, ya fue publicado
      if (boardLink) {
        return;
      }
      
      // Intentar obtener el tablero por slug
      try {
        const board = await boardService.getBoardBySlug(slug);
        if (board) {
          // El tablero existe, por lo que consideramos que la publicación fue exitosa
          const baseUrl = window.location.origin;
          const fullBoardLink = `${baseUrl}/board/${slug}`;
          setBoardLink(fullBoardLink);
          publishMutation.reset();
          onPublishSuccess(slug);
          
          // Actualizar el estado almacenado
          savePublishState({
            isPublishing: false,
            isPublished: true,
            slug,
            boardId,
            timestamp: Date.now()
          });
        } else {
          // El tablero no existe, reiniciar el estado
          publishMutation.reset();
          savePublishState({
            isPublishing: false,
            isPublished: false,
            slug,
            boardId,
            timestamp: Date.now()
          });
        }
      } catch {
        // Si hay un error al obtener el tablero, asumimos que aún no se ha publicado
        publishMutation.reset();
      }
    } catch (error) {
      console.error("Error checking publication status:", error);
      publishMutation.reset();
    }
  }, [boardId, boardLink, publishMutation, onPublishSuccess, savePublishState]);

  // Comprobar el estado guardado al iniciar
  useEffect(() => {
    const storedPublishState = sessionStorage.getItem(`publish-state-${boardId}`);
    if (storedPublishState) {
      try {
        const state = JSON.parse(storedPublishState) as StoredPublishState;
        // Si hay un estado guardado y es reciente (menos de 10 minutos)
        const isRecent = Date.now() - state.timestamp < 10 * 60 * 1000;
        
        if (isRecent && state.boardId === boardId) {
          // Si estaba publicado, actualizar UI
          if (state.isPublished) {
            const baseUrl = window.location.origin;
            const fullBoardLink = `${baseUrl}/board/${state.slug}`;
            setBoardLink(fullBoardLink);
            setCustomUrlSegment(state.slug);
            // Notificar éxito
            publishMutation.reset();
            onPublishSuccess(state.slug);
          } 
          // Si estaba en proceso y no completado, verificar estado actual
          else if (state.isPublishing) {
            checkPublicationStatus(state.slug);
          }
        } else {
          // Limpiar estado antiguo
          sessionStorage.removeItem(`publish-state-${boardId}`);
        }
      } catch (e) {
        console.error("Error parsing stored publish state:", e);
        sessionStorage.removeItem(`publish-state-${boardId}`);
      }
    }
  }, [boardId, checkPublicationStatus, onPublishSuccess, publishMutation]);

  // Manejar cambios de visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && publishMutation.isPending) {
        // La página volvió a estar visible y había un proceso en curso
        console.log("Tab is visible again, checking publication status");
        
        const storedPublishState = sessionStorage.getItem(`publish-state-${boardId}`);
        if (storedPublishState) {
          try {
            const state = JSON.parse(storedPublishState) as StoredPublishState;
            checkPublicationStatus(state.slug);
          } catch (e) {
            console.error("Error parsing stored publish state on visibility change:", e);
            publishMutation.reset();
          }
        } else {
          publishMutation.reset();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [boardId, publishMutation, checkPublicationStatus]);
  
  return {
    customUrlSegment,
    setCustomUrlSegment,
    boardLink,
    showAuthPrompt,
    publishingError,
    isPublishing: publishMutation.isPending,
    isPublished: !publishMutation.isPending && publishMutation.isSuccess && !!boardLink,
    publish: () => publishMutation.mutate(),
    reset: () => {
      publishMutation.reset();
      setPublishingError(null);
      sessionStorage.removeItem(`publish-state-${boardId}`);
    }
  };
}
