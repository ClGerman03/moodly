import { useState } from 'react';

/**
 * Hook personalizado para manejar la lógica de comentarios y feedback de imágenes
 * Separa la lógica de negocio de la presentación de UI
 */
export function useImageFeedback(
  initialComment: string = '',
  onSubmit?: (comment: string) => void
) {
  const [comment, setComment] = useState(initialComment);

  // Manejar cambios en el comentario
  const handleCommentChange = (value: string) => {
    setComment(value);
  };

  // Manejar envío de comentario
  const handleSubmitComment = (resetComment: boolean = true) => {
    if (comment.trim() && onSubmit) {
      onSubmit(comment);
      // Solo limpiar el comentario si se indica
      if (resetComment) {
        setComment('');
      }
    }
  };

  return {
    comment,
    setComment,
    handleCommentChange,
    handleSubmitComment
  };
}
