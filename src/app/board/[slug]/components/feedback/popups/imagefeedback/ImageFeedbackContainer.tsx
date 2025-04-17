"use client";

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ImageFeedbackPopup from './ImageFeedbackPopup';
import ImageFeedbackPopover from './ImageFeedbackPopover';

interface ImageFeedbackContainerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  onSubmitComment?: (comment: string) => void;
}

/**
 * Componente contenedor que decide qué versión del feedback mostrar
 * basado en el tamaño de la pantalla (responsivo)
 */
const ImageFeedbackContainer: React.FC<ImageFeedbackContainerProps> = (props) => {
  // Usar media query para detectar si estamos en desktop (>= 768px)
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Renderizar el componente de popup o popover según el tamaño de pantalla
  return isDesktop ? (
    <ImageFeedbackPopover {...props} />
  ) : (
    <ImageFeedbackPopup {...props} />
  );
};

export default ImageFeedbackContainer;
