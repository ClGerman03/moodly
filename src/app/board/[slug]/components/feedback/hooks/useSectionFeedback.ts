import { useState, useCallback } from 'react';
import { FeedbackType } from '../shared/FeedbackButtons';

/**
 * Estructura de datos estandarizada para un elemento de feedback
 * Incluye tanto la reacción como los comentarios asociados
 */
export interface FeedbackItem {
  itemId: string;                    // ID único del elemento (URL de imagen, ID de paleta, etc.)
  reaction?: FeedbackType;           // Tipo de reacción (positivo, negativo, comment)
  comments: {
    text: string;                    // Texto del comentario
    timestamp: string;               // Marca de tiempo ISO
  }[];
}

/**
 * Interface para las opciones del hook
 * @property {string} sectionId - ID de la sección
 * @property {Function} onFeedbackChange - Callback que se llama cuando cambia el feedback
 */
interface UseSectionFeedbackOptions {
  sectionId: string;
  onFeedbackChange?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Hook personalizado para gestionar feedback en cualquier tipo de sección
 * Proporciona una interfaz unificada para manejar reacciones y comentarios
 */
export function useSectionFeedback({
  sectionId,
  onFeedbackChange
}: UseSectionFeedbackOptions) {
  // Estado principal: colección de elementos de feedback
  const [feedbackItems, setFeedbackItems] = useState<Record<string, FeedbackItem>>({});
  
  // Estado para el elemento seleccionado actualmente para comentar
  const [selectedItemForComment, setSelectedItemForComment] = useState<string | null>(null);
  
  // Estado para el comentario actual que se está escribiendo
  const [currentComment, setCurrentComment] = useState("");

  /**
   * Notifica al componente padre sobre cambios en el feedback
   */
  const notifyFeedbackChange = useCallback((
    feedbackItems: Record<string, FeedbackItem>
  ) => {
    if (!onFeedbackChange) return;
    
    // Enviamos los datos en la nueva estructura estandarizada
    // Y también en formatos compatibles con el sistema actual para minimizar cambios iniciales
    
    // Construir objeto de reacciones en formato {itemId: reactionType}
    const reactions: Record<string, string> = {};
    
    // Preparar array para comentarios
    const allComments: Array<{ itemId: string; comment: string; timestamp: string }> = [];
    
    // Procesar todos los items de feedback
    Object.values(feedbackItems).forEach(item => {
      // Procesar reacción
      if (item.reaction) {
        reactions[item.itemId] = item.reaction;
      }
      
      // Procesar comentarios
      item.comments.forEach(comment => {
        allComments.push({
          itemId: item.itemId,
          comment: comment.text,
          timestamp: comment.timestamp
        });
      });
    });
    
    // Enviar datos al componente padre, incluyendo la estructura normalizada y formatos de compatibilidad
    onFeedbackChange(sectionId, {
      // Estructura normalizada (nueva)
      feedbackItems,
      
      // Para compatibilidad con formato de imágenes (legado)
      imageFeedback: reactions,
      comments: allComments,
      
      // Para compatibilidad con formato de paletas (legado)
      paletteFeedbacks: Object.values(feedbackItems)
        .filter(item => item.reaction)
        .map(item => ({
          paletteId: item.itemId,
          type: item.reaction as string,
          timestamp: new Date().toISOString()
        })),
        
      paletteComments: allComments.map(c => ({
        paletteId: c.itemId,
        comment: c.comment,
        timestamp: c.timestamp
      }))
    });
  }, [onFeedbackChange, sectionId]);

  /**
   * Maneja el feedback (reacciones) para un elemento específico
   * @param itemId - ID del elemento (url de imagen, id de paleta, etc.)
   * @param type - Tipo de feedback (positivo, negativo, comentario)
   */
  const handleItemFeedback = useCallback((itemId: string, type: FeedbackType) => {
    if (type === 'comment') {
      // Si es un comentario, seleccionar el elemento para mostrar formulario
      setSelectedItemForComment(itemId);
      return;
    }
    
    // Para reacciones (positivo/negativo), actualizar el estado
    setFeedbackItems(prev => {
      // Obtener estado actual o crear uno nuevo
      const currentItem = prev[itemId] || { 
        itemId, 
        comments: [] 
      };
      
      // Si el tipo es igual al actual, lo quitamos (toggle)
      const newItem = {
        ...currentItem,
        reaction: currentItem.reaction === type ? undefined : type
      };
      
      const newFeedbackItems = {
        ...prev,
        [itemId]: newItem
      };
      
      // Notificar cambios
      notifyFeedbackChange(newFeedbackItems);
      
      return newFeedbackItems;
    });
  }, [notifyFeedbackChange]);

  /**
   * Maneja el envío de un comentario para el elemento seleccionado
   * @param comment - Texto del comentario
   */
  const handleSubmitComment = useCallback((comment: string = currentComment) => {
    if (!selectedItemForComment || !comment.trim()) return;
    
    // Crear nuevo comentario con timestamp
    const newComment = {
      text: comment.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Actualizar el estado del feedback
    setFeedbackItems(prev => {
      // Obtener estado actual o crear uno nuevo
      const currentItem = prev[selectedItemForComment] || { 
        itemId: selectedItemForComment, 
        comments: [] 
      };
      
      // Verificar que no exista un comentario igual
      const commentExists = currentItem.comments.some(c => c.text === comment.trim());
      if (commentExists) return prev;
      
      // Añadir el nuevo comentario
      const newItem = {
        ...currentItem,
        comments: [...currentItem.comments, newComment]
      };
      
      const newFeedbackItems = {
        ...prev,
        [selectedItemForComment]: newItem
      };
      
      // Notificar cambios
      notifyFeedbackChange(newFeedbackItems);
      
      return newFeedbackItems;
    });
    
    // Limpiar estados
    setCurrentComment("");
    setSelectedItemForComment(null);
  }, [currentComment, selectedItemForComment, notifyFeedbackChange]);

  /**
   * Limpia el comentario y cierra el modo de comentario
   */
  const cancelComment = useCallback(() => {
    setCurrentComment("");
    setSelectedItemForComment(null);
  }, []);

  // Utilidades para acceder a los datos de feedback
  const getItemFeedback = useCallback((itemId: string): FeedbackType | undefined => {
    return feedbackItems[itemId]?.reaction;
  }, [feedbackItems]);
  
  const getItemComments = useCallback((itemId: string) => {
    const item = feedbackItems[itemId];
    if (!item || !item.comments.length) return [];
    
    return item.comments.map(c => ({
      itemId,
      comment: c.text,
      timestamp: c.timestamp
    }));
  }, [feedbackItems]);

  return {
    // Estados
    feedbackItems,
    selectedItemForComment,
    currentComment,
    
    // Acciones
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    
    // Utilidades
    isItemSelected: (itemId: string) => selectedItemForComment === itemId,
    getItemFeedback,
    getItemComments
  };
}
