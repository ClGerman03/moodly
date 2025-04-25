"use client";

import { useState, useRef, useMemo } from "react";
import { PanInfo } from "framer-motion";
import { Section } from "@/app/tablero/types";
import ImageFeedbackContainer from "../popups/imagefeedback/ImageFeedbackContainer";
import ImageCarousel from "../layout/ImageCarousel";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import FeedbackButtons from "../shared/FeedbackButtons";
import FeedbackIndicator from "../shared/FeedbackIndicator";
import ImageMetadataOverlay from "../shared/ImageMetadataOverlay";
import { useSectionFeedback } from "../hooks/useSectionFeedback";

interface BentoImageFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Componente para mostrar un carrusel de imágenes con overlay de metadatos y capacidad de feedback
 */
const BentoImageFeedback: React.FC<BentoImageFeedbackProps> = ({ 
  section,
  onFeedback
}) => {
  // Referencias y estados
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsiveLayout(containerRef);
  
  // Estados para el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Hook para gestión de feedback
  const {
    selectedItemForComment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });
  
  // Extraer datos de la sección
  const images = useMemo(() => section.data?.images || [], [section.data?.images]);
  const imageMetadata = useMemo(() => section.data?.imageMetadata || {}, [section.data?.imageMetadata]);
  
  // Obtener la imagen actual y sus metadatos
  const currentImage = images[currentImageIndex];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentImageMetadata = currentImage ? imageMetadata[currentImage] || {} : {};
  const currentFeedback = currentImage ? getItemFeedback(currentImage) : undefined;
  
  // Metadata de la imagen seleccionada para comentario (modal)
  const selectedImageMetadata = selectedItemForComment ? 
    imageMetadata[selectedItemForComment] || {} : {};

  // Ajustar altura del carrusel según el dispositivo
  const carouselHeight = isMobile ? "h-auto aspect-[3/4]" : "h-[60vh]";
  
  // Handlers para navegación del carrusel
  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50) {
      setDirection(1);
      setCurrentImageIndex(prev => Math.min(prev + 1, images.length - 1));
    } else if (info.offset.x > 50) {
      setDirection(-1);
      setCurrentImageIndex(prev => Math.max(prev - 1, 0));
    }
  };
  
  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setDirection(-1);
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setDirection(1);
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  return (
    <div className={isMobile ? "py-2" : "py-6"} ref={containerRef}>
      {/* Carrusel de imágenes */}
      <div className="max-w-4xl mx-auto">
        {/* Contenedor del carrusel */}
        <div className={`relative ${carouselHeight} transition-all duration-300 overflow-hidden rounded-xl`}>
          <ImageCarousel
            images={images}
            currentIndex={currentImageIndex}
            direction={direction}
            onSwipe={handleSwipe}
            onPrevious={goToPreviousImage}
            onNext={goToNextImage}
            isMobile={isMobile}
          >
            {(imageUrl: string) => {
              const metadata = imageMetadata[imageUrl] || {};
              const hasFeedback = getItemFeedback(imageUrl);
              const hasComments = getItemComments(imageUrl).length > 0;
              
              return (
                <div className="relative h-full w-full">
                  {/* Indicador de feedback si existe */}
                  {(hasFeedback || hasComments) && (
                    <div className="absolute top-3 right-3 z-20">
                      <FeedbackIndicator 
                        type={hasFeedback || 'hasComments'} 
                        hasComments={hasComments}
                        size={16} 
                        className="shadow-lg" 
                      />
                    </div>
                  )}
                  
                  {/* Overlay de metadatos */}
                  <div className="absolute inset-0 z-10">
                    <ImageMetadataOverlay 
                      metadata={metadata}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              );
            }}
          </ImageCarousel>
        </div>
        
        {/* Panel de feedback - completamente debajo del carrusel */}
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-50 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <FeedbackButtons
              onFeedback={(type) => handleItemFeedback(currentImage, type)}
              currentFeedback={currentFeedback}
              className="bg-transparent"
              allowComment={true}
              useMessageIcon={true} /* Usar el mismo icono en ambas versiones */
            />
          </div>
        </div>
      </div>
      
      {/* Modal de comentarios */}
      {selectedItemForComment && (
        <ImageFeedbackContainer
          isOpen={!!selectedItemForComment}
          onClose={cancelComment}
          imageUrl={selectedItemForComment}
          imageTitle={selectedImageMetadata.title || ""}
          imageTags={[]}
          onSubmitComment={(comment) => {
            setCurrentComment(comment);
            handleSubmitComment(comment);
          }}
          existingComments={getItemComments(selectedItemForComment).map(c => ({
            imageUrl: c.itemId,
            comment: c.comment,
            timestamp: c.timestamp || ''
          }))}
        />
      )}
    </div>
  );
};

export default BentoImageFeedback;
