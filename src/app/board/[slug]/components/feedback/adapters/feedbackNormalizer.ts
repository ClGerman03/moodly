/**
 * Adaptadores para normalizar los diferentes formatos de feedback
 * para su visualización en el componente FeedbackSummary.
 */

import { FeedbackItem } from '../hooks/useSectionFeedback';

// Tipos comunes para diferentes formatos de feedback
export interface NormalizedComment {
  id: string;          // Identificador único (URL de imagen, ID de paleta, etc.)
  comment: string;     // Texto del comentario
  timestamp?: string;  // Fecha y hora en que se realizó (ISO string)
}

export interface NormalizedReaction {
  id: string;               // Identificador único del item
  type: 'positive' | 'negative' | 'comment'; // Tipo de reacción
  timestamp?: string;       // Fecha y hora en que se realizó (ISO string)
}

export interface NormalizedFeedback {
  reactions: NormalizedReaction[];  // Todas las reacciones
  comments: NormalizedComment[];    // Todos los comentarios
}

/**
 * Normaliza la estructura estandarizada de FeedbackItem
 * Esta función se usa primero para convertir del formato nuevo estandarizado
 */
export function normalizeFromStandardFormat(
  feedbackItems?: Record<string, FeedbackItem>
): NormalizedFeedback {
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // Si no hay datos de feedback, retornar estructura vacía
  if (!feedbackItems) return result;
  
  // Procesar cada item de feedback
  Object.values(feedbackItems).forEach(item => {
    // Procesar la reacción si existe
    if (item.reaction) {
      result.reactions.push({
        id: item.itemId,
        type: item.reaction
      });
    }
    
    // Procesar todos los comentarios asociados
    item.comments.forEach(comment => {
      result.comments.push({
        id: item.itemId,
        comment: comment.text,
        timestamp: comment.timestamp
      });
    });
  });
  
  return result;
}

/**
 * Normaliza el feedback de una galería de imágenes
 */
export function normalizeImageGalleryFeedback(
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el nuevo formato estandarizado, usarlo directamente
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Caso contrario, procesar el formato legacy
  const imageFeedback = sectionFeedback.imageFeedback as Record<string, string> || {};
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // Procesar reacciones (formato: { imageUrl: reactionType })
  Object.entries(imageFeedback).forEach(([imageUrl, reactionType]) => {
    result.reactions.push({
      id: imageUrl,
      type: reactionType as 'positive' | 'negative' | 'comment'
    });
  });
  
  // Procesar comentarios en formato de array
  const comments = sectionFeedback.comments as Array<{
    itemId: string;
    comment: string;
    timestamp?: string;
  }> | undefined;
  
  if (comments && Array.isArray(comments)) {
    comments.forEach(comment => {
      result.comments.push({
        id: comment.itemId,
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Procesar comentario en formato antiguo (objeto único)
  const singleComment = sectionFeedback.commentContent as {
    imageUrl: string;
    comment: string;
    timestamp?: string;
  } | undefined;
  
  if (singleComment && singleComment.imageUrl && singleComment.comment) {
    // Verificar si este comentario ya está incluido
    const isDuplicate = result.comments.some(
      c => c.id === singleComment.imageUrl && c.comment === singleComment.comment
    );
    
    if (!isDuplicate) {
      result.comments.push({
        id: singleComment.imageUrl,
        comment: singleComment.comment,
        timestamp: singleComment.timestamp
      });
    }
  }
  
  return result;
}

/**
 * Normaliza el feedback de una paleta de colores
 */
export function normalizePaletteFeedback(
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el nuevo formato estandarizado, usarlo directamente
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Caso contrario, procesar el formato legacy
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // Procesar múltiples feedbacks (formato más nuevo)
  const paletteFeedbacks = sectionFeedback.paletteFeedbacks as Array<{
    paletteId: string;
    type: string;
    timestamp: string;
  }> | undefined;
  
  if (paletteFeedbacks && Array.isArray(paletteFeedbacks)) {
    paletteFeedbacks.forEach(feedback => {
      result.reactions.push({
        id: feedback.paletteId,
        type: feedback.type as 'positive' | 'negative' | 'comment',
        timestamp: feedback.timestamp
      });
    });
  } 
  // Si no hay array de feedbacks, intentar con el feedback único
  else {
    const paletteFeedback = sectionFeedback.paletteFeedback as {
      paletteId: string;
      type: string;
      timestamp: string;
    } | undefined;
    
    if (paletteFeedback) {
      result.reactions.push({
        id: paletteFeedback.paletteId,
        type: paletteFeedback.type as 'positive' | 'negative' | 'comment',
        timestamp: paletteFeedback.timestamp
      });
    }
  }
  
  // Procesar comentarios en formato de array
  const paletteComments = sectionFeedback.paletteComments as Array<{
    paletteId: string;
    comment: string;
    timestamp?: string;
  }> | undefined;
  
  if (paletteComments && Array.isArray(paletteComments)) {
    paletteComments.forEach(comment => {
      result.comments.push({
        id: comment.paletteId,
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Procesar comentario en formato de objeto único
  const paletteComment = sectionFeedback.paletteComment as {
    paletteId: string;
    comment: string;
    timestamp?: string;
  } | undefined;
  
  if (paletteComment && paletteComment.comment) {
    // Verificar si este comentario ya está incluido
    const isDuplicate = result.comments.some(
      c => c.id === paletteComment.paletteId && c.comment === paletteComment.comment
    );
    
    if (!isDuplicate) {
      result.comments.push({
        id: paletteComment.paletteId,
        comment: paletteComment.comment,
        timestamp: paletteComment.timestamp
      });
    }
  }
  
  return result;
}

/**
 * Normaliza el feedback de tipografía
 */
export function normalizeTypographyFeedback(
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el nuevo formato estandarizado, usarlo directamente
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Caso contrario, procesar el formato legacy
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // En tipografía solo hay selección y comentario simple
  const selectedFont = sectionFeedback.selectedFont as string | null;
  const fontComment = sectionFeedback.comment as string | null;
  
  if (selectedFont) {
    result.reactions.push({
      id: selectedFont,
      type: 'positive'  // La selección de fuente se considera feedback positivo
    });
  }
  
  if (fontComment) {
    result.comments.push({
      id: 'typography',  // ID genérico para comentarios de tipografía
      comment: fontComment
    });
  }
  
  return result;
}

/**
 * Normaliza el feedback de secciones de texto
 */
export function normalizeTextFeedback(
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el nuevo formato estandarizado, usarlo directamente
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Caso contrario, procesar el formato legacy
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // Para texto solo hay likes/dislikes y un comentario
  const likedText = sectionFeedback.liked === true;
  const dislikedText = sectionFeedback.liked === false;
  const textComment = sectionFeedback.comment as string | undefined;

  // Añadir reacción basada en like/dislike
  if (likedText) {
    result.reactions.push({
      id: 'text',
      type: 'positive'
    });
  } else if (dislikedText) {
    result.reactions.push({
      id: 'text',
      type: 'negative'
    });
  }
  
  // Añadir comentario si existe
  if (textComment) {
    result.comments.push({
      id: 'text',
      comment: textComment
    });
  }
  
  return result;
}

/**
 * Normaliza el feedback de links
 */
export function normalizeLinksFeedback(
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el nuevo formato estandarizado, usarlo directamente
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Caso contrario, procesar el formato legacy
  const result: NormalizedFeedback = {
    reactions: [],
    comments: []
  };
  
  // Para links podemos tener likes/dislikes por URL y comentarios
  const linkFeedbacks = sectionFeedback.linkFeedbacks as Array<{
    url: string;
    liked: boolean;
    timestamp: string;
  }> | undefined;

  // Procesar reacciones por link
  if (linkFeedbacks && Array.isArray(linkFeedbacks)) {
    linkFeedbacks.forEach(feedback => {
      result.reactions.push({
        id: feedback.url,
        type: feedback.liked ? 'positive' : 'negative',
        timestamp: feedback.timestamp
      });
    });
  }
  
  // Procesar comentarios de links
  const linkComments = sectionFeedback.linkComments as Array<{
    url: string;
    comment: string;
    timestamp?: string;
  }> | undefined;
  
  if (linkComments && Array.isArray(linkComments)) {
    linkComments.forEach(comment => {
      result.comments.push({
        id: comment.url,
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  return result;
}

/**
 * Normaliza el feedback basado en el tipo de sección
 */
export function normalizeFeedback(
  sectionType: string,
  sectionFeedback: Record<string, unknown>
): NormalizedFeedback {
  // Si tenemos el formato estandarizado, usarlo directamente sin importar el tipo
  if (sectionFeedback.feedbackItems) {
    return normalizeFromStandardFormat(sectionFeedback.feedbackItems as Record<string, FeedbackItem>);
  }
  
  // Utilizar el normalizador adecuado según el tipo de sección
  switch(sectionType) {
    case 'imageGallery':
      return normalizeImageGalleryFeedback(sectionFeedback);
    case 'palette':
      return normalizePaletteFeedback(sectionFeedback);
    case 'typography':
      return normalizeTypographyFeedback(sectionFeedback);
    case 'text':
      return normalizeTextFeedback(sectionFeedback);
    case 'links':
      return normalizeLinksFeedback(sectionFeedback);
    default:
      // Para tipos desconocidos, devolver estructura vacía
      return {
        reactions: [],
        comments: []
      };
  }
}
